import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { firstCallArg } from '../../../test/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

const CONFIG: Record<string, string | number> = {
  'security.bcryptCost': 4,
  'jwt.accessSecret': 'test-access-secret-16+',
  'jwt.accessTtl': '15m',
  'jwt.refreshSecret': 'test-refresh-secret-16+',
  'jwt.refreshTtl': '7d',
};

describe('AuthService', () => {
  let service: AuthService;
  let passwordHash: string;

  const prisma = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  const jwt = {
    signAsync: jest.fn(),
    decode: jest.fn(),
  };

  const user = {
    id: 'user-1',
    name: 'Alice',
    username: 'alice',
    email: 'alice@x.dev',
    role: Role.USER,
    passwordChangedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Password123!', 4);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jwt.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');
    jwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: { getOrThrow: (key: string) => CONFIG[key] },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('signup', () => {
    it('stores a bcrypt hash and returns the user without it', async () => {
      prisma.user.create.mockResolvedValue({ ...user, username: 'newbie' });

      const result = await service.signup({
        name: 'Alice',
        username: 'newbie',
        email: 'new@x.dev',
        password: 'Password123!',
      });

      const createArgs = firstCallArg<{
        data: { passwordHash: string };
        select: Record<string, boolean>;
      }>(prisma.user.create);
      expect(createArgs.data.passwordHash).not.toContain('Password123!');
      await expect(
        bcrypt.compare('Password123!', createArgs.data.passwordHash),
      ).resolves.toBe(true);
      expect(createArgs.select).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.username).toBe('newbie');
    });
  });

  describe('login', () => {
    it('returns tokens and the safe user for valid credentials', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...user, passwordHash });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login({
        identifier: 'alice',
        password: 'Password123!',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user.username).toBe('alice');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
    });

    it('rejects an unknown identifier with 401', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ identifier: 'ghost', password: 'x'.repeat(8) }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a wrong password with the same 401 (no user enumeration)', async () => {
      prisma.user.findFirst.mockResolvedValue({ ...user, passwordHash });

      await expect(
        service.login({ identifier: 'alice', password: 'WrongPass123!' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    const ctx = { userId: 'user-1', jti: 'jti-1', token: 'old-refresh' };
    const row = {
      id: 'row-1',
      userId: 'user-1',
      tokenHash: 'irrelevant',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };

    it('rotates atomically: claims the presented token via conditional update, then issues a new pair', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(row);
      prisma.user.findUnique.mockResolvedValue({ ...user, passwordHash });
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      prisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refresh(ctx);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { id: 'row-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
      expect(prisma.refreshToken.create).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('rejects a concurrent double-spend: losing the atomic claim → 401, no new pair', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(row);
      // Another request claimed the token between our read and our update.
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.refresh(ctx)).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown token with 401', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refresh(ctx)).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a revoked token with 401 and does not rotate', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...row,
        revokedAt: new Date(),
      });

      await expect(service.refresh(ctx)).rejects.toThrow(UnauthorizedException);
      expect(prisma.refreshToken.create).not.toHaveBeenCalled();
    });

    it('rejects an expired token with 401', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...row,
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(service.refresh(ctx)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    const row = {
      id: 'row-1',
      userId: 'user-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    };

    it("revokes the caller's own active token", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(row);
      prisma.refreshToken.update.mockResolvedValue({});

      await service.logout('user-1', 'the-token');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });

    it("does NOT revoke another user's token", async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        ...row,
        userId: 'someone-else',
      });

      await service.logout('user-1', 'the-token');

      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });

    it('is a silent no-op for an unknown token (idempotent)', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.logout('user-1', 'gone')).resolves.toBeUndefined();
      expect(prisma.refreshToken.update).not.toHaveBeenCalled();
    });
  });
});

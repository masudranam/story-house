import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const prisma = { user: { findUnique: jest.fn() } };
  const nowSeconds = Math.floor(Date.now() / 1000);
  const payload = { sub: 'user-1', username: 'alice', iat: nowSeconds };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => 'test-access-secret-16+' },
        },
      ],
    }).compile();
    strategy = module.get(JwtStrategy);
  });

  it('resolves identity from the database, not from token claims', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice_renamed',
      role: Role.ADMIN,
      passwordChangedAt: null,
    });

    // The token says username "alice" / no role; the DB is authoritative.
    await expect(strategy.validate(payload)).resolves.toEqual({
      id: 'user-1',
      username: 'alice_renamed',
      role: Role.ADMIN,
    });
  });

  it('rejects a token whose user no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects a token issued before the last password change', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      role: Role.USER,
      passwordChangedAt: new Date(Date.now() + 60_000),
    });

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('accepts a token issued after the last password change', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      role: Role.USER,
      passwordChangedAt: new Date(Date.now() - 60_000),
    });

    await expect(strategy.validate(payload)).resolves.toMatchObject({
      id: 'user-1',
    });
  });
});

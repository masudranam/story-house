import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { firstCallArg } from '../../../test/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersQueryDto } from './dto/users-query.dto';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let passwordHash: string;

  const prisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    story: { count: jest.fn() },
    comment: { count: jest.fn() },
    refreshToken: { updateMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const dbUser = {
    id: 'user-1',
    name: 'Alice',
    username: 'alice',
    email: 'alice@x.dev',
    role: Role.USER,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
  const me = { id: 'user-1', username: 'alice', role: Role.USER };
  const admin = { id: 'admin-1', username: 'admin', role: Role.ADMIN };

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Password123!', 4);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: { getOrThrow: () => 4 } },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  describe('getMe', () => {
    it('returns the user with email, never the hash', async () => {
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await service.getMe('user-1');

      expect(result.email).toBe('alice@x.dev');
      expect(result).not.toHaveProperty('passwordHash');
      const args = firstCallArg<{ select: Record<string, boolean> }>(
        prisma.user.findUnique,
      );
      expect(args.select).not.toHaveProperty('passwordHash');
    });

    it('404s when the token references a deleted user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getMe('gone')).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    it('rejects a wrong current password with 401', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'WrongPass123!',
          newPassword: 'NewPassword456!',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects a new password equal to the current one with 400', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });

      await expect(
        service.changePassword('user-1', {
          currentPassword: 'Password123!',
          newPassword: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rehashes, stamps passwordChangedAt, and revokes all refresh tokens', async () => {
      prisma.user.findUnique.mockResolvedValue({ ...dbUser, passwordHash });
      prisma.$transaction.mockResolvedValue([{}, {}]);

      await service.changePassword('user-1', {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword456!',
      });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      const updateArgs = firstCallArg<{
        data: { passwordHash: string; passwordChangedAt: Date };
      }>(prisma.user.update);
      expect(updateArgs.data.passwordChangedAt).toBeInstanceOf(Date);
      await expect(
        bcrypt.compare('NewPassword456!', updateArgs.data.passwordHash),
      ).resolves.toBe(true);
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', revokedAt: null },
        data: { revokedAt: expect.any(Date) as Date },
      });
    });
  });

  describe('deleteMe', () => {
    it('deletes a regular user', async () => {
      prisma.user.delete.mockResolvedValue(dbUser);
      await service.deleteMe(me);
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });

    it('rejects admin self-deletion with 403', async () => {
      await expect(service.deleteMe(admin)).rejects.toThrow(ForbiddenException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('getPublicProfile', () => {
    it('never selects the email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-2',
        name: 'Bob',
        username: 'bob',
        role: Role.USER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.getPublicProfile('user-2');

      expect(result).not.toHaveProperty('email');
      const args = firstCallArg<{ select: Record<string, boolean> }>(
        prisma.user.findUnique,
      );
      expect(args.select).not.toHaveProperty('email');
    });

    it('404s for an unknown id', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getPublicProfile('nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adminList', () => {
    it('searches username OR name OR email, filters role, and paginates', async () => {
      prisma.$transaction.mockResolvedValue([[dbUser], 1]);

      const query = new UsersQueryDto();
      query.page = 2;
      query.limit = 5;
      query.search = 'ali';
      query.role = Role.USER;

      const result = await service.adminList(query);

      const findArgs = firstCallArg<{
        where: { role: Role; OR: unknown[] };
        skip: number;
        take: number;
      }>(prisma.user.findMany);
      expect(findArgs.where.role).toBe(Role.USER);
      expect(findArgs.where.OR).toHaveLength(3);
      expect(findArgs.skip).toBe(5);
      expect(findArgs.take).toBe(5);
      expect(result.meta).toEqual({
        page: 2,
        limit: 5,
        totalItems: 1,
        totalPages: 1,
      });
      expect(result.data[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('adminDelete', () => {
    it('rejects deleting your own admin account with 403', async () => {
      await expect(service.adminDelete(admin, 'admin-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });

    it('deletes another user', async () => {
      prisma.user.delete.mockResolvedValue(dbUser);
      await service.adminDelete(admin, 'user-1');
      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });
  });

  describe('stats', () => {
    it('aggregates all five counters in one transaction', async () => {
      prisma.$transaction.mockResolvedValue([10, 20, 30, 2, 4]);

      const result = await service.stats();

      expect(result).toEqual({
        totalUsers: 10,
        totalStories: 20,
        totalComments: 30,
        newUsersThisWeek: 2,
        newStoriesThisWeek: 4,
      });
    });
  });
});

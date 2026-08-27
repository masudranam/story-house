import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const prisma = { user: { findUnique: jest.fn() } };
  const payload = { sub: 'user-1', username: 'alice', tokenVersion: 0 };

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
      tokenVersion: 0,
    });

    // The token says username "alice" and carries no role; the DB wins.
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

  it('rejects a token carrying a superseded version, however recently minted', async () => {
    // The bug this replaced: a timestamp comparison let a token minted in the
    // same second as the password change survive. Version compare cannot.
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      role: Role.USER,
      tokenVersion: 1,
    });

    await expect(
      strategy.validate({ ...payload, tokenVersion: 0 }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('accepts a token whose version matches the current one', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      username: 'alice',
      role: Role.USER,
      tokenVersion: 3,
    });

    await expect(
      strategy.validate({ ...payload, tokenVersion: 3 }),
    ).resolves.toMatchObject({
      id: 'user-1',
    });
  });
});

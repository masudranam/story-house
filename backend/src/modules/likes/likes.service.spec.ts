import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { LikesService } from './likes.service';

describe('LikesService', () => {
  let service: LikesService;

  const prisma = {
    story: { findUnique: jest.fn() },
    like: { upsert: jest.fn(), deleteMany: jest.fn() },
  };

  const user = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(LikesService);
  });

  it('like: 404s for an unknown story', async () => {
    prisma.story.findUnique.mockResolvedValue(null);
    await expect(service.like(user, 'nope')).rejects.toThrow(NotFoundException);
    expect(prisma.like.upsert).not.toHaveBeenCalled();
  });

  it('like: upserts so double-liking is a silent success (idempotent)', async () => {
    prisma.story.findUnique.mockResolvedValue({ id: 'story-1' });
    prisma.like.upsert.mockResolvedValue({});

    await service.like(user, 'story-1');
    await service.like(user, 'story-1');

    expect(prisma.like.upsert).toHaveBeenCalledTimes(2);
    expect(prisma.like.upsert).toHaveBeenCalledWith({
      where: { userId_storyId: { userId: 'user-1', storyId: 'story-1' } },
      update: {},
      create: { userId: 'user-1', storyId: 'story-1' },
    });
  });

  it('unlike: deleteMany so unliking a non-like is a silent success (idempotent)', async () => {
    prisma.story.findUnique.mockResolvedValue({ id: 'story-1' });
    prisma.like.deleteMany.mockResolvedValue({ count: 0 });

    await expect(service.unlike(user, 'story-1')).resolves.toBeUndefined();
    expect(prisma.like.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', storyId: 'story-1' },
    });
  });

  it('unlike: 404s for an unknown story', async () => {
    prisma.story.findUnique.mockResolvedValue(null);
    await expect(service.unlike(user, 'nope')).rejects.toThrow(
      NotFoundException,
    );
  });
});

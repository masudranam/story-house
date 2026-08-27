import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { firstCallArg } from '../../../test/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { StoriesQueryDto } from './dto/stories-query.dto';
import { StoriesService } from './stories.service';

describe('StoriesService', () => {
  let service: StoriesService;

  const prisma = {
    story: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    like: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const alice = { id: 'user-1', username: 'alice', role: Role.USER };
  const bob = { id: 'user-2', username: 'bob', role: Role.USER };
  const admin = { id: 'admin-1', username: 'admin', role: Role.ADMIN };

  const row = {
    id: 'story-1',
    title: 'Title',
    content: 'Body',
    author: { id: 'user-1', name: 'Alice', username: 'alice' },
    _count: { likes: 3, comments: 2 },
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-02'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoriesService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(StoriesService);
  });

  describe('list', () => {
    it('maps counts into the entity and builds search/sort/pagination args', async () => {
      prisma.$transaction.mockResolvedValue([[row], 1]);

      const query = new StoriesQueryDto();
      query.page = 3;
      query.limit = 4;
      query.search = 'light';
      query.sort = 'createdAt:asc';

      const result = await service.list(query);

      const findArgs = firstCallArg<{
        where: { title: { contains: string; mode: string } };
        orderBy: { createdAt: string };
        skip: number;
        take: number;
      }>(prisma.story.findMany);
      expect(findArgs.where.title).toEqual({
        contains: 'light',
        mode: 'insensitive',
      });
      expect(findArgs.orderBy).toEqual({ createdAt: 'asc' });
      expect(findArgs.skip).toBe(8);
      expect(findArgs.take).toBe(4);

      expect(result.data[0]).toMatchObject({ likesCount: 3, commentsCount: 2 });
      expect(result.data[0]).not.toHaveProperty('_count');
      expect(result.data[0].likedByMe).toBeUndefined();
      expect(result.meta).toEqual({
        page: 3,
        limit: 4,
        totalItems: 1,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('404s for a missing story', async () => {
      prisma.story.findUnique.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });

    it('omits likedByMe for anonymous readers', async () => {
      prisma.story.findUnique.mockResolvedValue(row);

      const result = await service.findOne('story-1');

      expect(result.likedByMe).toBeUndefined();
      expect(prisma.like.findUnique).not.toHaveBeenCalled();
    });

    it('sets likedByMe from the like table for authenticated readers', async () => {
      prisma.story.findUnique.mockResolvedValue(row);
      prisma.like.findUnique.mockResolvedValue({ userId: 'user-2' });

      const result = await service.findOne('story-1', bob);

      expect(result.likedByMe).toBe(true);
      expect(prisma.like.findUnique).toHaveBeenCalledWith({
        where: { userId_storyId: { userId: 'user-2', storyId: 'story-1' } },
        select: { userId: true },
      });
    });

    it('sets likedByMe=false when no like row exists', async () => {
      prisma.story.findUnique.mockResolvedValue(row);
      prisma.like.findUnique.mockResolvedValue(null);

      const result = await service.findOne('story-1', bob);

      expect(result.likedByMe).toBe(false);
    });
  });

  describe('create', () => {
    it('takes the author from the JWT user, never the body', async () => {
      prisma.story.create.mockResolvedValue({
        ...row,
        _count: { likes: 0, comments: 0 },
      });

      const result = await service.create(alice, {
        title: 'Title',
        content: 'Body',
      });

      const createArgs = firstCallArg<{ data: { authorId: string } }>(
        prisma.story.create,
      );
      expect(createArgs.data.authorId).toBe('user-1');
      expect(result.likedByMe).toBe(false);
      expect(result.likesCount).toBe(0);
    });
  });

  describe('update', () => {
    it('404s when the story does not exist', async () => {
      prisma.story.findUnique.mockResolvedValue(null);
      await expect(
        service.update(alice, 'nope', { title: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejects editing another user's story with 403 — even for admins", async () => {
      prisma.story.findUnique.mockResolvedValue({ authorId: 'user-1' });

      await expect(
        service.update(bob, 'story-1', { title: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(admin, 'story-1', { title: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.story.update).not.toHaveBeenCalled();
    });

    it('lets the owner update', async () => {
      prisma.story.findUnique.mockResolvedValue({ authorId: 'user-1' });
      prisma.story.update.mockResolvedValue(row);

      const result = await service.update(alice, 'story-1', { title: 'New' });

      expect(result.id).toBe('story-1');
    });
  });

  describe('remove', () => {
    it('rejects a non-owner non-admin with 403', async () => {
      prisma.story.findUnique.mockResolvedValue({ authorId: 'user-1' });

      await expect(service.remove(bob, 'story-1')).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.story.delete).not.toHaveBeenCalled();
    });

    it('lets the owner delete', async () => {
      prisma.story.findUnique.mockResolvedValue({ authorId: 'user-1' });
      prisma.story.delete.mockResolvedValue({});

      await service.remove(alice, 'story-1');

      expect(prisma.story.delete).toHaveBeenCalledWith({
        where: { id: 'story-1' },
      });
    });

    it('lets an ADMIN moderate (delete) any story', async () => {
      prisma.story.findUnique.mockResolvedValue({ authorId: 'user-1' });
      prisma.story.delete.mockResolvedValue({});

      await service.remove(admin, 'story-1');

      expect(prisma.story.delete).toHaveBeenCalledTimes(1);
    });

    it('404s when the story does not exist', async () => {
      prisma.story.findUnique.mockResolvedValue(null);
      await expect(service.remove(admin, 'nope')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

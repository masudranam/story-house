import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { firstCallArg } from '../../../test/test-helpers';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentsService } from './comments.service';
import { CommentsQueryDto } from './dto/comments-query.dto';

describe('CommentsService', () => {
  let service: CommentsService;

  const prisma = {
    story: { findUnique: jest.fn() },
    comment: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const alice = { id: 'user-1', username: 'alice', role: Role.USER };
  const bob = { id: 'user-2', username: 'bob', role: Role.USER };
  const admin = { id: 'admin-1', username: 'admin', role: Role.ADMIN };

  const row = {
    id: 'comment-1',
    content: 'Nice!',
    storyId: 'story-1',
    author: { id: 'user-1', name: 'Alice', username: 'alice' },
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-01'),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get(CommentsService);
  });

  describe('listForStory', () => {
    it('404s for an unknown story before querying comments', async () => {
      prisma.story.findUnique.mockResolvedValue(null);

      await expect(
        service.listForStory('nope', { page: 1, limit: 10, skip: 0 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('returns newest-first paginated comments', async () => {
      prisma.story.findUnique.mockResolvedValue({ id: 'story-1' });
      prisma.$transaction.mockResolvedValue([[row], 1]);

      const result = await service.listForStory('story-1', {
        page: 1,
        limit: 10,
        skip: 0,
      });

      const findArgs = firstCallArg<{ orderBy: { createdAt: string } }>(
        prisma.comment.findMany,
      );
      expect(findArgs.orderBy).toEqual({ createdAt: 'desc' });
      expect(result.data[0]).toMatchObject({
        id: 'comment-1',
        content: 'Nice!',
      });
      expect(result.meta.totalItems).toBe(1);
    });
  });

  describe('createForStory', () => {
    it('404s for an unknown story', async () => {
      prisma.story.findUnique.mockResolvedValue(null);
      await expect(
        service.createForStory(alice, 'nope', { content: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('authors the comment from the JWT user', async () => {
      prisma.story.findUnique.mockResolvedValue({ id: 'story-1' });
      prisma.comment.create.mockResolvedValue(row);

      await service.createForStory(alice, 'story-1', { content: 'Nice!' });

      const createArgs = firstCallArg<{
        data: { authorId: string; storyId: string };
      }>(prisma.comment.create);
      expect(createArgs.data).toMatchObject({
        authorId: 'user-1',
        storyId: 'story-1',
      });
    });
  });

  describe('update', () => {
    it('404s for a missing comment', async () => {
      prisma.comment.findUnique.mockResolvedValue(null);
      await expect(
        service.update(alice, 'nope', { content: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('rejects non-owners with 403 — including admins (edit is owner-only)', async () => {
      prisma.comment.findUnique.mockResolvedValue({ authorId: 'user-1' });

      await expect(
        service.update(bob, 'comment-1', { content: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update(admin, 'comment-1', { content: 'x' }),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.comment.update).not.toHaveBeenCalled();
    });

    it('lets the owner edit', async () => {
      prisma.comment.findUnique.mockResolvedValue({ authorId: 'user-1' });
      prisma.comment.update.mockResolvedValue(row);

      const result = await service.update(alice, 'comment-1', {
        content: 'Edited',
      });

      expect(result.id).toBe('comment-1');
    });
  });

  describe('remove', () => {
    it('rejects a non-owner non-admin with 403', async () => {
      prisma.comment.findUnique.mockResolvedValue({ authorId: 'user-1' });
      await expect(service.remove(bob, 'comment-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('lets the owner and admins delete', async () => {
      prisma.comment.findUnique.mockResolvedValue({ authorId: 'user-1' });
      prisma.comment.delete.mockResolvedValue({});

      await service.remove(alice, 'comment-1');
      await service.remove(admin, 'comment-1');

      expect(prisma.comment.delete).toHaveBeenCalledTimes(2);
    });
  });

  describe('adminList', () => {
    it('searches content OR author username and filters by story', async () => {
      prisma.$transaction.mockResolvedValue([[row], 1]);

      const query = new CommentsQueryDto();
      query.search = 'nice';
      query.storyId = 'story-1';

      await service.adminList(query);

      const findArgs = firstCallArg<{
        where: { storyId: string; OR: unknown[] };
      }>(prisma.comment.findMany);
      expect(findArgs.where.storyId).toBe('story-1');
      expect(findArgs.where.OR).toHaveLength(2);
    });
  });
});

import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { StoryCommentsController } from './story-comments.controller';

describe('StoryCommentsController', () => {
  let controller: StoryCommentsController;

  const commentsService = {
    listForStory: jest.fn(),
    createForStory: jest.fn(),
  };
  const user = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoryCommentsController],
      providers: [{ provide: CommentsService, useValue: commentsService }],
    }).compile();
    controller = module.get(StoryCommentsController);
  });

  it('list scopes comments to the story from the URL', async () => {
    commentsService.listForStory.mockResolvedValue({ data: [], meta: {} });
    const query = new PaginationQueryDto();

    await controller.list('story-1', query);

    expect(commentsService.listForStory).toHaveBeenCalledWith('story-1', query);
  });

  it('create takes the story from the URL and the author from the token', async () => {
    commentsService.createForStory.mockResolvedValue({ id: 'c1' });

    await controller.create(user, 'story-1', { content: 'Nice!' });

    expect(commentsService.createForStory).toHaveBeenCalledWith(
      user,
      'story-1',
      {
        content: 'Nice!',
      },
    );
  });

  describe('DTO validation', () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    it('rejects empty and oversized comment bodies', async () => {
      const meta = { type: 'body' as const, metatype: CreateCommentDto };
      await expect(pipe.transform({ content: '' }, meta)).rejects.toThrow();
      await expect(
        pipe.transform({ content: 'x'.repeat(2001) }, meta),
      ).rejects.toThrow();
    });

    it('rejects a client-supplied author or storyId in the body', async () => {
      const meta = { type: 'body' as const, metatype: CreateCommentDto };
      await expect(
        pipe.transform({ content: 'hi', authorId: 'someone-else' }, meta),
      ).rejects.toThrow();
      await expect(
        pipe.transform({ content: 'hi', storyId: 'other' }, meta),
      ).rejects.toThrow();
    });
  });
});

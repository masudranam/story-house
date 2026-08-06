import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CommentsQueryDto } from './dto/comments-query.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;

  const commentsService = {
    adminList: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const user = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [{ provide: CommentsService, useValue: commentsService }],
    }).compile();
    controller = module.get(CommentsController);
  });

  it('update and remove pass the acting user for ownership checks', async () => {
    commentsService.update.mockResolvedValue({ id: 'c1' });
    commentsService.remove.mockResolvedValue(undefined);

    await controller.update(user, 'c1', { content: 'edited' });
    await controller.remove(user, 'c1');

    expect(commentsService.update).toHaveBeenCalledWith(user, 'c1', {
      content: 'edited',
    });
    expect(commentsService.remove).toHaveBeenCalledWith(user, 'c1');
  });

  it('adminList forwards the validated query', async () => {
    commentsService.adminList.mockResolvedValue({ data: [], meta: {} });
    const query = new CommentsQueryDto();
    query.search = 'spam';

    await controller.adminList(query);

    expect(commentsService.adminList).toHaveBeenCalledWith(query);
  });

  describe('DTO validation', () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });

    it('requires non-empty content within 2000 chars on update', async () => {
      const meta = { type: 'body' as const, metatype: UpdateCommentDto };
      await expect(pipe.transform({ content: '' }, meta)).rejects.toThrow();
      await expect(
        pipe.transform({ content: 'x'.repeat(2001) }, meta),
      ).rejects.toThrow();
      await expect(pipe.transform({ content: 'fine' }, meta)).resolves.toEqual({
        content: 'fine',
      });
    });

    it('rejects an unknown filter and a non-uuid storyId', async () => {
      const meta = { type: 'query' as const, metatype: CommentsQueryDto };
      await expect(pipe.transform({ author: 'alice' }, meta)).rejects.toThrow();
      await expect(pipe.transform({ storyId: 'nope' }, meta)).rejects.toThrow();
    });
  });
});

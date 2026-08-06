import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';

describe('LikesController', () => {
  let controller: LikesController;

  const likesService = { like: jest.fn(), unlike: jest.fn() };
  const user = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikesController],
      providers: [{ provide: LikesService, useValue: likesService }],
    }).compile();
    controller = module.get(LikesController);
  });

  it('like/unlike act on the authenticated user, not a client-supplied id', async () => {
    likesService.like.mockResolvedValue(undefined);
    likesService.unlike.mockResolvedValue(undefined);

    await controller.like(user, 'story-1');
    await controller.unlike(user, 'story-1');

    expect(likesService.like).toHaveBeenCalledWith(user, 'story-1');
    expect(likesService.unlike).toHaveBeenCalledWith(user, 'story-1');
  });

  it('returns nothing (204 no body) from both routes', async () => {
    likesService.like.mockResolvedValue(undefined);
    await expect(controller.like(user, 'story-1')).resolves.toBeUndefined();
  });
});

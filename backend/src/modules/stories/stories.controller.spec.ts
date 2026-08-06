import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import { StoriesQueryDto } from './dto/stories-query.dto';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';

describe('StoriesController', () => {
  let controller: StoriesController;

  const storiesService = {
    list: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const user = { id: 'user-1', username: 'alice', role: Role.USER };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoriesController],
      providers: [{ provide: StoriesService, useValue: storiesService }],
    }).compile();
    controller = module.get(StoriesController);
  });

  it('create takes the author from the token, never the body', async () => {
    storiesService.create.mockResolvedValue({ id: 's1' });

    await controller.create(user, { title: 'T', content: 'C' });

    expect(storiesService.create).toHaveBeenCalledWith(user, {
      title: 'T',
      content: 'C',
    });
  });

  it('findOne forwards the optional user so likedByMe can be resolved', async () => {
    storiesService.findOne.mockResolvedValue({ id: 's1' });

    await controller.findOne('s1', user);
    await controller.findOne('s1', undefined);

    expect(storiesService.findOne).toHaveBeenNthCalledWith(1, 's1', user);
    expect(storiesService.findOne).toHaveBeenNthCalledWith(2, 's1', undefined);
  });

  it('update and remove pass the acting user for ownership checks', async () => {
    storiesService.update.mockResolvedValue({ id: 's1' });
    storiesService.remove.mockResolvedValue(undefined);

    await controller.update(user, 's1', { title: 'New' });
    await controller.remove(user, 's1');

    expect(storiesService.update).toHaveBeenCalledWith(user, 's1', {
      title: 'New',
    });
    expect(storiesService.remove).toHaveBeenCalledWith(user, 's1');
  });

  describe('StoriesQueryDto validation', () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    });
    const meta = { type: 'query' as const, metatype: StoriesQueryDto };

    it('applies defaults and coerces numeric strings', async () => {
      const result = (await pipe.transform({}, meta)) as StoriesQueryDto;
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.sort).toBe('createdAt:desc');

      const coerced = (await pipe.transform(
        { page: '3', limit: '5' },
        meta,
      )) as StoriesQueryDto;
      expect(coerced.page).toBe(3);
      expect(coerced.skip).toBe(10);
    });

    it('rejects an unsupported sort field', async () => {
      await expect(
        pipe.transform({ sort: 'title:asc' }, meta),
      ).rejects.toThrow();
    });

    it('rejects unknown query params and non-uuid authorId', async () => {
      await expect(
        pipe.transform({ category: 'fiction' }, meta),
      ).rejects.toThrow();
      await expect(
        pipe.transform({ authorId: 'not-a-uuid' }, meta),
      ).rejects.toThrow();
    });

    it('caps limit at 100', async () => {
      await expect(pipe.transform({ limit: '500' }, meta)).rejects.toThrow();
    });
  });
});

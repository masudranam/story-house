import { StoryController } from '../../controller/storyController.ts';
import { storyAttributes } from '../../dto/story/storyAttributes.ts';
import { storyService } from '../../services/storyService.ts';
import { httpStatus } from '../../utils/httpStatus.ts';
import { mockStoryInput, mockStoryOutput } from '../fixtures/storyFixture.ts';
import { mockRequest } from '../utils/mockRequest.ts';
import { mockResponse } from '../utils/mockResponse.ts';

describe('StoryController', () => {
  const controller = new StoryController();

  const res = mockResponse();

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('postStory', () => {
    const req = mockRequest({
      body: mockStoryInput,
      user: { id: 'user1', role: 1 },
    });

    it('should return 201 and created story', async () => {
      const mockStory = mockStoryInput;
      jest.spyOn(storyService, 'postStory').mockResolvedValue(mockStory);

      await controller.postStory(req, res, next);

      expect(storyService.postStory).toHaveBeenCalledWith(mockStory);
      expect(res.status).toHaveBeenCalledWith(httpStatus.CREATED);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Story Successfully created',
        data: mockStory,
      });
    });

    it('should call next on error', async () => {
      const error = new Error('fail');
      jest.spyOn(storyService, 'postStory').mockRejectedValue(error);

      await controller.postStory(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getStories', () => {
    const req = mockRequest({ query: { search: 'trip' } });

    it('should return 200 with stories', async () => {
      const mockStories = [mockStoryOutput];
      jest.spyOn(storyService, 'getAllStories').mockResolvedValue(mockStories);

      await controller.getStories(req, res, next);

      expect(storyService.getAllStories).toHaveBeenCalledWith(req.query);
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith(mockStories);
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(storyService, 'getAllStories').mockRejectedValue(error);

      await controller.getStories(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteAllStories', () => {
    const req = mockRequest();

    it('should return 200 and result', async () => {
      const result = { deleted: 5 };
      jest
        .spyOn(storyService, 'deleteAllStories')
        .mockResolvedValue({ deleted: 5 });

      await controller.deleteAllStories(req, res, next);

      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'All stories deleted successfully',
        ...result,
      });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(storyService, 'deleteAllStories').mockRejectedValue(error);

      await controller.deleteAllStories(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteStoryByStoryId', () => {
    const req = mockRequest({
      params: { id: 'story1' },
      user: { id: 'user1', role: 0 },
    });

    it('should return 200 and delete message', async () => {
      jest.spyOn(storyService, 'deleteStoryByStoryId').mockResolvedValue(1);

      await controller.deleteStoryByStoryId(req, res, next);

      expect(storyService.deleteStoryByStoryId).toHaveBeenCalledWith(
        'story1',
        'user1',
      );
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'story with id story1 deleted successfully',
      });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(storyService, 'deleteStoryByStoryId').mockRejectedValue(error);

      await controller.deleteStoryByStoryId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getStoryByStoryId', () => {
    const req = mockRequest({ params: { id: 'story1' } });

    it('should return 200 and story', async () => {
      const mockStory = mockStoryOutput;
      jest
        .spyOn(storyService, 'getStoryByStoryId')
        .mockResolvedValue(mockStory);

      await controller.getStoryByStoryId(req, res, next);

      expect(storyService.getStoryByStoryId).toHaveBeenCalledWith('story1');
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({ story: mockStory });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(storyService, 'getStoryByStoryId').mockRejectedValue(error);

      await controller.getStoryByStoryId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateStoryByStoryId', () => {
    const req = mockRequest({
      params: { id: 'story1' },
      body: { title: 'New', description: 'Updated' },
    });

    it('should return 200 and updated story', async () => {
      const updated: storyAttributes = {
        title: 'New',
        description: 'Updated',
      };

      jest
        .spyOn(storyService, 'updateStoryByStoryId')
        .mockResolvedValue(updated);

      await controller.updateStoryByStoryId(req, res, next);

      expect(storyService.updateStoryByStoryId).toHaveBeenCalledWith('story1', {
        title: 'New',
        description: 'Updated',
      });
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Story updated',
        story: updated,
      });
    });

    it('should call next on error', async () => {
      const error = new Error();
      jest.spyOn(storyService, 'updateStoryByStoryId').mockRejectedValue(error);

      await controller.updateStoryByStoryId(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

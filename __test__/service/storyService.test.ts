import { storyService } from '../../services/storyService.ts';
import { storyRepository } from '../../repository/storyRepository.ts';
import { createStoryDTO } from '../../dto/DTO.ts';
import { storyFilters } from '../../dto/story/storyFilters.ts';
import { mockStoryInput, mockStoryOutput } from '../fixtures/storyFixture.ts';

jest.mock('../../repository/storyRepository.ts');

describe('StoryService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('postStory', () => {
    it('create story and return story information', async () => {
      const input: createStoryDTO = mockStoryInput;

      const mockStory = { id: '1', ...input };

      (storyRepository.postStory as jest.Mock).mockResolvedValue(mockStory);

      const result = await storyService.postStory(input);
      expect(result).toEqual(mockStory);
      expect(storyRepository.postStory).toHaveBeenCalledWith(input);
    });
  });

  describe('getAllStories', () => {
    it('return filtered and paginated stories', async () => {
      const query: storyFilters = {
        title: 'trip',
        page: 1,
        limit: 10,
        sort: 'asc',
      };
      const mockStories = [mockStoryOutput];

      (storyRepository.getAllStories as jest.Mock).mockResolvedValue(
        mockStories,
      );

      const result = await storyService.getAllStories(query);
      expect(result).toEqual(mockStories);
      expect(storyRepository.getAllStories).toHaveBeenCalledWith(
        { title: 'trip' },
        'ASC',
        10,
        0,
      );
    });
});

    it('should throw error if no stories found', async () => {
      (storyRepository.getAllStories as jest.Mock).mockResolvedValue(null);
      await expect(storyService.getAllStories({})).rejects.toThrow(
        'No story exist',
      );
    });
  });

  describe('deleteAllStories', () => {
    it('return number of story deleted', async () => {
      (storyRepository.deleteAllStories as jest.Mock).mockResolvedValue(5);

      const result = await storyService.deleteAllStories();
      expect(result).toEqual({ deleted: 5 });
    });
  });

  describe('deleteStoryByStoryId', () => {
    it('delte the story if user is authorized', async () => {
      (storyRepository.deleteStoryByStoryId as jest.Mock).mockResolvedValue(1);

      const result = await storyService.deleteStoryByStoryId('s1', 'u1');
      expect(result).toBe(1);
    });

    it('should throw error if not deleted', async () => {
      (storyRepository.deleteStoryByStoryId as jest.Mock).mockResolvedValue(0);

      await expect(
        storyService.deleteStoryByStoryId('s1', 'u1'),
      ).rejects.toThrow('story not found or unauthorized');
    });
  });

  describe('getStoryByStoryId', () => {
    it('return a story with given ID', async () => {
      const story = { id: '1', title: 'trip' };
      (storyRepository.findStoryByStoryId as jest.Mock).mockResolvedValue(
        story,
      );

      const result = await storyService.getStoryByStoryId('1');
      expect(result).toEqual(story);
    });

    it('should throw error if story not found', async () => {
      (storyRepository.findStoryByStoryId as jest.Mock).mockResolvedValue(null);

      await expect(storyService.getStoryByStoryId('1')).rejects.toThrow(
        'story not found',
      );
    });
  });

  describe('updateStoryByStoryId', () => {
    it('update story title and description', async () => {
      const story = { id: '1', title: 'Old' };
      const updated = { id: '1', title: 'New', description: 'Updated' };

      (storyRepository.findStoryByStoryId as jest.Mock).mockResolvedValue(
        story,
      );
      (storyRepository.updateStoryByStoryId as jest.Mock).mockResolvedValue(
        updated,
      );

      const result = await storyService.updateStoryByStoryId('1', {
        title: 'New',
        description: 'Updated',
      });

      expect(result).toEqual(updated);
      expect(storyRepository.updateStoryByStoryId).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'New',
          description: 'Updated',
          lastModificationTime: expect.any(Date),
        }),
      );
    });

    it('should throw error if story not found before update', async () => {
      (storyRepository.findStoryByStoryId as jest.Mock).mockResolvedValue(null);

      await expect(
        storyService.updateStoryByStoryId('1', { title: 'X' }),
      ).rejects.toThrow('Story not found');
    });
  });

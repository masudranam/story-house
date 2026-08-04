import { createStoryDTO } from '../dto/DTO.ts';
import { storyAttributes } from '../dto/story/storyAttributes.ts';
import { storyFilters } from '../dto/story/storyFilters.ts';
import { storyRepository } from '../repository/storyRepository.ts';

class StoryService {
  async postStory(data: createStoryDTO) {
    const story = await storyRepository.postStory(data);
    return story;
  }

  async getAllStories(query: storyFilters) {
    const filters: storyFilters = {};
    const sort = query.sort === 'asc' ? 'ASC' : 'DESC';

    if (query.authorId) filters.authorId = query.authorId;
    if (query.title) filters.title = query.title;

    const page = Number(query.page) || 1;
    let limit = Number(query.limit) || 100;

    const offset = (page - 1) * limit;

    const {count, rows} = await storyRepository.getAllStories(
      filters,
      sort,
      limit,
      offset,
    );
    return {count, rows};
  }

  async deleteAllStories(): Promise<{ deleted: number }> {
    const deleted = await storyRepository.deleteAllStories();
    return { deleted };
  }

  async deleteStoryByStoryId(storyId: string, userId: string) {
    const deleted = await storyRepository.deleteStoryByStoryId(storyId, userId);
    if (deleted === 0) throw new Error('story not found or unauthorized');
    return deleted;
  }

  async getStoryByStoryId(id: string) {
    const story = await storyRepository.findStoryByStoryId(id);
    if (!story) throw new Error('story not found');
    return story;
  }

  async updateStoryByStoryId(
    storyId: string,
    data: { title?: string; description?: string },
  ) {
    const story = await storyRepository.findStoryByStoryId(storyId);
    if (!story) throw new Error('Story not found');

    const updatedData: storyAttributes = {
      lastModificationTime: new Date(),
    };

    if (data.title?.trim()) updatedData.title = data.title;
    if (data.description?.trim()) updatedData.description = data.description;

    return await storyRepository.updateStoryByStoryId(storyId, updatedData);
  }
}

export const storyService = new StoryService();

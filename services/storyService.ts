import { createStoryDTO } from '../dto/DTO';
import { storyRepository } from '../repository/storyRepository.ts';

class StoryService {
  async postStory(data: createStoryDTO) {
    const story = await storyRepository.postStory(data);
    return story;
  }

  async getAllStories() {
    const stories = await storyRepository.getAllStories();
    if (!stories) throw new Error('No story exist');
    return stories;
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

    const updatedData: any = {
      lastModificationTime: new Date(),
    };

    if (data.title?.trim()) updatedData.title = data.title;
    if (data.description?.trim()) updatedData.description = data.description;

    return await storyRepository.updateStoryByStoryId(storyId, updatedData);
  }
}

export const storyService = new StoryService();

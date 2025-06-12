import { createStoryDTO } from '../dto/DTO.ts';
import { Story } from '../database/database.ts';

class StoryRepository {
  async postStory(data: createStoryDTO, userId: any) {
    const story = await Story.create({
      title: data.title,
      description: data.description,
      authorId: userId,
      lastModifierId: userId,
      lastModificationTime: new Date(),
    });
    return story;
  }

  getAllStories = async () => {
    const stories = await Story.findAll();
    return stories;
  };

  async deleteAllStories(): Promise<number> {
    const deleteCount = await Story.destroy({ where: {}, truncate: true });
    return deleteCount;
  }

  async findStoryByStoryId(id: string) {
    const story = Story.findByPk(id);
    return story;
  }

  async updateStoryByStoryId(
    id: string,
    data: Partial<{ title: string; description: string }>,
  ) {
    const story = await Story.findByPk(id);
    if (!story) return null;
    await story.update(data);
    return story;
  }

  async deleteStoryByStoryId(storyId: string, userId: string) {
    const deleteCount = await Story.destroy({
      where: {
        id: storyId,
        authorId: userId,
      },
    });
    return deleteCount;
  }
}

export const storyRepository = new StoryRepository();

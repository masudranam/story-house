import { Op, WhereOptions } from 'sequelize';

import { createStoryDTO } from '../dto/DTO.ts';
import { Story } from '../database/database.ts';
import { storyFilters } from '../dto/story/storyFilters.ts';
import { storyAttributes } from '../dto/story/storyAttributes.ts';

class StoryRepository {
  async postStory(data: createStoryDTO): Promise<storyAttributes> {
    const story = await Story.create({
      title: data.title,
      description: data.description,
      authorId: data.authorId,
      lastModifierId: data.authorId,
      lastModificationTime: new Date(),
    });
    return story;
  }

  getAllStories = async (
    filters: storyFilters,
    sort: 'ASC' | 'DESC',
    limit: number,
    offset: number,
  ): Promise<storyAttributes[]> => {
    const where: WhereOptions = {};
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.title) {
      where.title = { [Op.iLike]: `%${filters.title}%` };
    }

    const stories: storyAttributes[] = await Story.findAll({
      where,
      order: [['updatedAt', sort]],
      limit,
      offset,
    });
    return stories;
  };

  async deleteAllStories(): Promise<number> {
    const deleteCount: number = await Story.destroy({ where: {} });
    return deleteCount;
  }

  async findStoryByStoryId(id: string): Promise<storyAttributes | null> {
    const story: storyAttributes | null = await Story.findByPk(id);

    return story;
  }

  async updateStoryByStoryId(
    storyId: string,
    data: Partial<{ title: string; description: string }>,
  ): Promise<storyAttributes | null> {
    const story = await Story.findByPk(storyId);
    if (!story) return null;
    const updatedStory: storyAttributes = await story.update(data);
    return updatedStory;
  }

  async deleteStoryByStoryId(storyId: string, userId: string): Promise<number> {
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

import { Op, WhereOptions } from 'sequelize';

import { createStoryDTO } from '../dto/DTO.ts';
import { Story } from '../database/database.ts';
import { storyFilters } from '../dto/storyFilters.ts';


class StoryRepository {
  async postStory(data: createStoryDTO) {
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
  ) => {
    const where: WhereOptions = {};
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.title) {
      where.title = { [Op.iLike]: `%${filters.title}%` };
    }

    const stories = await Story.findAll({
      where,
      order: [['updatedAt', sort]],
      limit,
      offset,
    });
    return stories;
  };

  async deleteAllStories(): Promise<number> {
    const deleteCount = await Story.destroy({ where: {} });
    return deleteCount;
  }

  async findStoryByStoryId(id: string) {
    return await Story.findByPk(id);
  }

  async updateStoryByStoryId(
    storyId: string,
    data: Partial<{ title: string; description: string }>,
  ) {
    const story = await Story.findByPk(storyId);
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

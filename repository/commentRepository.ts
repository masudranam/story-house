import { FindAndCountOptions, Op } from 'sequelize';

import { Comment, Story, User } from '../database/database.ts';
import { searchCommentParams } from '../dto/comment/searchCommentParams.ts';
import { commentAttributes } from '../dto/comment/commentAttributes.ts';

class CommentRepository {
  async postCommentByStoryId(
    comment: commentAttributes,
  ): Promise<commentAttributes> {
    const story = await Story.findByPk(comment.storyId);
    if (!story) throw new Error('Story not found');
    const { content, storyId, userId } = comment;
    return await Comment.create({ content, storyId, userId });
  }

  async findCommentById(id: string): Promise<commentAttributes | null> {
    return await Comment.findByPk(id);
  }

  async editCommentByCommentId(id: string, content: string): Promise<commentAttributes> {
    const [count, rows] = await Comment.update(
      { content },
      { where: { id }, returning: true },
    );
    const comment: commentAttributes = rows[0];
    return comment;
  }

  async deleteCommentByCommentId(id: string): Promise<number> {
    return await Comment.destroy({ where: { id } });
  }

  async searchComments(params: searchCommentParams) {
    const { content, author, storyId, page = 1, limit = 1000 } = params;

    const where: NonNullable<FindAndCountOptions['where']> = {};
    if (content) where.content = { [Op.iLike]: `%${content}%` };
    if (storyId) where.storyId = storyId;

    const include: NonNullable<FindAndCountOptions['include']> = [];

    if (author) {
      include.push({
        model: User,
        as: 'author',
        where: { username: { [Op.iLike]: `%${author}%` } },
        attributes: ['id', 'username'],
      });
    } else {
      include.push({
        model: User,
        as: 'author',
        attributes: ['id', 'username'],
      });
    }
    const options: FindAndCountOptions = {
      where,
      include,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
    };
    const { rows, count } = await Comment.findAndCountAll(options);
    return { rows, count };
  }
}

export const commentRepository = new CommentRepository();

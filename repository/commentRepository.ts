import { Comment, Story } from '../database/database.ts';

class CommentRepository {
  async postCommentByStoryId(content: string, storyId: string, userId: string) {
    console.log(storyId);
    const story = await Story.findByPk(storyId);

    if (!story) throw new Error('Story not found');
    return await Comment.create({ content, storyId, userId });
  }

  async findCommentById(id: string) {
    return await Comment.findByPk(id);
  }

  async editCommentByCommentId(id: string, content: string) {
    const [count, rows] = await Comment.update(
      { content },
      { where: { id }, returning: true },
    );
    return rows[0];
  }

  async deleteCommentByCommentId(id: string) {
    return await Comment.destroy({ where: { id } });
  }
}

export const commentRepository = new CommentRepository();

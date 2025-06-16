import { Comment } from '../database/database.ts';

class CommentRepository {
  async postComment(content: string, storyId: string, userId: string) {
    return await Comment.create({ content, storyId, userId });
  }

  async findCommentById(id: string) {
    return await Comment.findByPk(id);
  }

  async updateCommentContentById(id: string, content: string) {
    return await Comment.update(
      { content },
      { where: { id }, returning: true },
    ).then((res) => res[1][0]);
  }
  async deleteCommentById(id: string) {
    return await Comment.destroy({ where: { id } });
  }
}

export const commentRepository = new CommentRepository();

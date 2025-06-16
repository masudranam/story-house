import { commentRepository } from '../repository/commentRepository';

class CommentService {
  async postCommentById(content: string, storyId: string, userId: string) {
    return await commentRepository.postComment(content, storyId, userId);
  }

  async findCommentById(id: string) {
    return await commentRepository.findCommentById(id);
  }

  async updateCommentContentById(
    commentId: string,
    content: string,
    userId: string,
  ) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment || comment.userId !== userId)
      throw new Error('Not authorized or not found');
    return commentRepository.updateCommentContentById(commentId, content);
  }

  async deleteCommentById(commentId: string, userId: string) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment || comment.userId !== userId)
      throw new Error('Not authorized or not found');
    return commentRepository.deleteCommentById(commentId);
  }
}

export const commentService = new CommentService();

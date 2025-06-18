import { commentRepository } from '../repository/commentRepository.ts';

class CommentService {
  async postCommentByStoryId(content: string, storyId: string, userId: string) {
    return await commentRepository.postCommentByStoryId(
      content,
      storyId,
      userId,
    );
  }

  async findCommentById(id: string) {
    return await commentRepository.findCommentById(id);
  }

  async editCommentByCommentId(
    commentId: string,
    content: string,
    userId: string,
  ) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new Error('Not authorized or not found');
    return commentRepository.editCommentByCommentId(commentId, content);
  }

  async deleteCommentByCommentId(commentId: string, userId: string) {
    const comment = await commentRepository.findCommentById(commentId);
    if (!comment) throw new Error('Not authorized or not found');
    return commentRepository.deleteCommentByCommentId(commentId);
  }
}

export const commentService = new CommentService();

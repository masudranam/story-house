import { commentRepository } from '../repository/commentRepository.ts';
import { searchCommentParams } from '../dto/searchCommentParams.ts';

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

    async searchComments(params: searchCommentParams) {
    const { page = 1, limit = 10 } = params;
    const { rows, count } = await commentRepository.searchComments(params);

    return {
      data: rows,
      total: count,
      page,
      limit,
      total_page: Math.ceil(count / limit),
    };
  }
}

export const commentService = new CommentService();

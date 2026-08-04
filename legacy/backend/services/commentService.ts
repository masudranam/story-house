import { commentRepository } from '../repository/commentRepository.ts';
import { searchCommentParams } from '../dto/comment/searchCommentParams.ts';
import { commentAttributes } from '../dto/comment/commentAttributes.ts';

class CommentService {
  async postCommentByStoryId(commentData: commentAttributes) {
    const comment: commentAttributes = commentData;
    return await commentRepository.postCommentByStoryId(comment);
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
    if (!comment) throw new Error('comment not found');
    return commentRepository.deleteCommentByCommentId(commentId);
  }

async searchComments(
  params: searchCommentParams,
): Promise<{ rows: commentAttributes[]; count: number }> {
  return await commentRepository.searchComments(params);
}
}

export const commentService = new CommentService();

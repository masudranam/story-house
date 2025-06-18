import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/commentService.ts';
import { Comment } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { getUserReqInformation } from '../utils/getUserInformation.ts';

class CommentController {
  async postComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserReqInformation(req);

      const comment = await commentService.postCommentByStoryId(
        req.body.content,
        req.body.storyId,
        String(userId),
      );
      res.status(httpStatus.CREATED).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async editCommentByCommentId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const updated = await commentService.editCommentByCommentId(
        req.params.id,
        req.body.content,
        (req as any).user.id,
      );
      res.status(httpStatus.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteCommentByCommentId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = req.params.id;
      const userId = req.user!.id;
      console.log(commentId, userId);
      const cnt = await commentService.deleteCommentByCommentId(
        commentId,
        userId,
      );
      res.status(204).json({message: `comment with id ${commentId} has been deleted`});
    } catch (err) {
      next(err);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    const comments = await Comment.findAll();
    res.json(comments);
    return;
  }

  async deleteComments(req: Request, res: Response) {
    const comments = await Comment.destroy({ where: {} });
    res.json(comments);
    return;
  }
}

export const commentController = new CommentController();

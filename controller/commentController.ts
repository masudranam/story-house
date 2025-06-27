import { Request, Response, NextFunction } from 'express';

import { commentService } from '../services/commentService.ts';
import { Comment } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRequest } from '../dto/user/userRequest.ts';

export class CommentController {
  async postComment(req: userRequest, res: Response, next: NextFunction) {
    try {
      req.body.userId = req.user!.id;
      req.body.storyId = req.params.id;
      const comment = await commentService.postCommentByStoryId(req.body);
      console.log(comment);
      res.status(httpStatus.CREATED).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async editCommentByCommentId(
    req: userRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const updated = await commentService.editCommentByCommentId(
        req.params.id,
        req.body.content,
        req.user!.id,
      );
      res.status(httpStatus.OK).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteCommentByCommentId(
    req: userRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = req.params.id;
      const userId = req.user!.id;
      await commentService.deleteCommentByCommentId(commentId, userId);
      res
        .status(httpStatus.OK)
        .json({ message: `comment with id ${commentId} has been deleted` });
    } catch (err) {
      next(err);
    }
  }

  async searchComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commentService.searchComments(req.query);
      res.status(httpStatus.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteAllComments(req: Request, res: Response) {
    const comments = await Comment.destroy({ where: {} });
    res.json(comments);
    return;
  }
}

export const commentController = new CommentController();

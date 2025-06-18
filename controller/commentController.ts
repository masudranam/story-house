import { Request, Response, NextFunction } from 'express';

import { commentService } from '../services/commentService.ts';
import { Comment } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRequest } from '../dto/userRequest.ts';
import { searchCommentParams } from '../dto/searchCommentParams.ts';

class CommentController {
  async postComment(req: userRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const comment = await commentService.postCommentByStoryId(
        req.body.content,
        req.body.storyId,
        userId,
      );
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
    req: userRequest ,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const commentId = req.params.id;
      const userId = req.user!.id;
      console.log(commentId, userId);
      await commentService.deleteCommentByCommentId(
        commentId,
        userId,
      );
      res
        .status(204)
        .json({ message: `comment with id ${commentId} has been deleted` });
    } catch (err) {
      next(err);
    }
  }

  async searchComment(req: Request, res: Response, next: NextFunction){
      try {
    const result = await commentService.searchComments(req.query);
    res.json(result);
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

import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/commentService';
import { authenticatedRequest } from '../dto/authenticatedRequest';

class CommentController {
  async postComment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const comment = await commentService.postCommentById(
        req.body.content,
        req.body.storyId,
        (req as any).user.id,
      );
      res.status(201).json(comment);
    } catch (err) {
      next(err);
    }
  }

  async updateComment(
    req: authenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const updated = await commentService.updateCommentContentById(
        req.params.id,
        req.body.content,
        req.user.id,
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async deleteCommentById(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await commentService.deleteCommentById(req.params.id, (req as any).user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async getComments(){

  }

  async deleteComments(){

  }
}

export const commentController = new CommentController();

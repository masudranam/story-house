import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/commentService.ts';
import { Comment } from '../database/database.ts';

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
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const updated = await commentService.updateCommentContentById(
        req.params.id,
        req.body.content,
        (req as any).user.id,
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

  async getComments(req: Request, res: Response, next: NextFunction){
    const comments =  await Comment.findAll();
     res.json(comments);
    return;
  }

  async deleteComments(req: Request, res: Response){
    const comments =  await Comment.destroy({where: {}});
    res.json(comments);
    return;
  }
}

export const commentController = new CommentController();

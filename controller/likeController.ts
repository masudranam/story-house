import { NextFunction, Request, Response } from 'express';

import { likeService } from '../services/likeService.ts';
import { Like } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRequest } from '../dto/user/userRequest.ts';

class LikeController {
  async likeStory(req: userRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { storyId } = req.params;
      await likeService.likeStory(userId, storyId);
      res
        .status(httpStatus.CREATED)
        .json({ message: `user id ${userId} liked story id ${storyId}` });
    } catch (err) {
      next(err);
    }
  }

  async unlikeStory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { storyId } = req.params;
      await likeService.unlikeStory(userId, storyId);
      res.json({ message: `user id ${userId} unliked story id ${storyId}` });
    } catch (err) {
      next(err);
    }
  }

  async getLikesCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { storyId } = req.params;
      const count = await likeService.getLikesCount(storyId);
      res.json({ storyId, likes: count });
    } catch (err) {
      next(err);
    }
  }

  async getAllLikes(req: Request, res: Response) {
    const likes = await Like.findAll({ where: {} });
    res.send(likes);
  }
}

export const likeController = new LikeController();

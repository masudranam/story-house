import { Request, Response, NextFunction } from 'express';
import { storyService } from '../services/storyService.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';

class StoryController {
  async postStory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      req.body.authorId = userId;
      const story = await storyService.postStory(req.body);
      res
        .status(httpStatus.CREATED)
        .json({ message: 'Story Successfully created', data: story });
    } catch (err) {
      next(err);
    }
  }

  async getStories(req: Request, res: Response, next: NextFunction) {
    try {
      const stories = await storyService.getAllStories();
      res.status(httpStatus.OK).json(stories);
    } catch (err) {
      next(err);
    }
  }

  async deleteAllStories(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = (req as any).user.id;
      if(user !== userRole.ADMIN)throw new Error('You are not admin');
      const result = await storyService.deleteAllStories();
      res.status(httpStatus.OK).json({
        message: 'All stories deleted successfully',
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteStoryByStoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.id;
      const userId = (req as any).user.id;
      const deleted = await storyService.deleteStoryByStoryId(storyId, userId);
      res.status(httpStatus.OK).json({ message: 'story deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getStoryByStoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const storyId = req.params.id;
      const story = await storyService.getStoryByStoryId(storyId);
      res.status(httpStatus.OK).json({ story });
    } catch (err) {
      next(err);
    }
  }

  async updateStoryByStoryId(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id;
      const userId = (req as any).user.id;
      const { title, description } = req.body;
      const updated = await storyService.updateStoryByStoryId(id, userId, {
        title,
        description,
      });
      res
        .status(httpStatus.OK)
        .json({ message: 'Story updated', story: updated });
    } catch (err) {
      next(err);
    }
  }
}

export const storyController = new StoryController();

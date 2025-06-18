import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';
import { Story } from '../database/database.ts';
import { authReq } from './authMiddleware.ts';

export async function canEditOrDeleteStory(
  req: authReq,
  res: Response,
  next: NextFunction,
) {
  try {
    const storyId = req.params.id;
    const story = await Story.findOne({ where: { id: storyId } });
    if (!story) throw new Error('Story does not exist');

    const userId = req.user?.id;
    const userrole = req.user?.role;
    if (userId !== story.authorId && userrole !== userRole.ADMIN) {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Unauthorized to perform action' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

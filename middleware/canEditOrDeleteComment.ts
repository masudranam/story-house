import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';
import { Comment } from '../database/database.ts';

export async function canEditOrDeleteComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) throw new Error('comment does not exist');

    const userId = (req as any).user.id;
    const userrole = (req as any).user.role;
    if (userId !== comment.userId && userrole !== userRole.ADMIN) {
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

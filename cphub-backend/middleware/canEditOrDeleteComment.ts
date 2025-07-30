import { Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';
import { Comment } from '../database/database.ts';
import { userRequest } from '../dto/user/userRequest.ts';

export async function canEditOrDeleteComment(
  req: userRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const commentId = req.params.id;
    const comment = await Comment.findOne({ where: { id: commentId } });
    if (!comment) throw new Error('comment not found');

    const userId = req.user?.id;
    const userrole = req.user?.role;
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

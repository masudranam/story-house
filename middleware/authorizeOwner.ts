import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';
import { authReq } from './authMiddleware.ts';

export async function authorizeOwner(
  req: authReq,
  res: Response,
  next: NextFunction,
) {
  try {
    const paramId = req.params.id;
    const userId = req.user?.id;
    const userrole = req.user?.role;

    if (!userId) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
      return;
    }

    if (paramId !== userId && userrole !== userRole.ADMIN) {
      res
        .status(httpStatus.FORBIDDEN)
        .json({ message: 'Forbidden: You are not owner' });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}

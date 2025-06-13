import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { userRole } from '../utils/userRole.ts';

export async function authorizeOwner(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const paramId = req.params.id;
    const userId = (req as any).user.id;
    const userrole = (req as any).user.role;

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

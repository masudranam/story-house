import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/database.ts';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(httpStatus.FORBIDDEN).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || 'secret',
    ) as { userId: string; role: number; exp: number };

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token expired' });
      return;
    }

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'User not found' });
      return;
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    next(err);
  }
}

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Story } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';

export async function storyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.FORBIDDEN).json({ message: 'No token have sent' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decode = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || 'secret',
    );
    const storyId = req.params.id;
    const story = await Story.findByPk(storyId);

    if (!story) {
      res.status(httpStatus.FORBIDDEN).json({ message: 'Forbidden'});
      return;
    }
    (req as any).story = story;
    
    next();
  } catch (err) {
    next(err);
  }
}

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { httpStatus } from '../utils/httpStatus.ts';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(httpStatus.FORBIDDEN).json({ message: 'No token have sent' });
    return;
  }
  const token = authHeader.split(' ')[1];
  console.log('this is old token', token);
  try {
    const decode = jwt.verify(token, 'secret');
    console.log('deocde', decode);
    (req as any).user = decode;
    next();
  } catch {
    res.status(httpStatus.FORBIDDEN).json({ message: 'Invalid token' });
    return;
  }
};

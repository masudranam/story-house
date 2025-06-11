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

  try {
    const decode = jwt.decode(token) as { exp: number };
    const curTime = Math.floor(Date.now() / 1000);
    console.log(`curTime = ${curTime}, expTime = ${decode.exp}`);

    if (decode.exp < curTime) {
      res.status(httpStatus.UNAUTHORIZED).json({ message: 'Token Expired' });
      return;
    }

    const decoded = jwt.verify(
      token,
      (process.env.JWT_SECRET as string) || 'secret',
    );

    (req as any).user = decoded;
    next();
  } catch (err) {
    next(err);
    // res.status(httpStatus.FORBIDDEN).json({ message: 'Invalid token' });
    // return;
  }
};

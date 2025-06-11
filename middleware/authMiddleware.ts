import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';

class MiddleWare {
  async authMiddleware(req: Request, res: Response, next: NextFunction) {
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
    }
  }

  async storyUpdateMiddleware(req: Request, res: Response, next: NextFunction) {
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
      const userName = (decode as any).username;
      const user = await User.findOne({ where: { username: userName } });
      (req as any).user = user;
      next();
    } catch (err) {
      next(err);
    }
  }
}

export const middleWare = new MiddleWare();

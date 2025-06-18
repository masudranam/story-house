import jwt from 'jsonwebtoken';
import {   Response, NextFunction } from 'express';

import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/database.ts';
import { userRequest } from '../dto/userRequest.ts';
 

export async function authMiddleware(
  req: userRequest,
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

    // req.headers["x-user-id"] = decoded.userId;
    // req.headers["x-user-role"] = `${decoded.role}`;

    req.user = {
      id: decoded.userId,
      role: decoded.role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

import { NextFunction, Response, Request } from 'express';

import { Auth } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { authService } from '../services/authService.ts';

export class AuthController {
  async signUpUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.signUpUser(req.body);
      res
        .status(httpStatus.CREATED)
        .json({ message: 'User registered successfully', user });
        
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginUser(req.body);
      res.status(httpStatus.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = await Auth.findAll();
      if (!auth.length)
        res.status(httpStatus.NOT_FOUND).json({ error: 'No users exist' });
      res.status(httpStatus.OK).json(auth);
      return;
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

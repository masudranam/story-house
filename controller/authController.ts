import { Auth } from '../database/database.ts';
import { authRepository } from '../repository/authRepository.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { NextFunction } from 'express';
import {createAuthDTO} from '../dto/DTO.ts';
import { registerUserService } from '../services/authService.ts';

class AuthController {
  async signUpUser(req: any, res: any, next: NextFunction) {
    try {
      const user = await registerUserService(req.body);
      res
        .status(httpStatus.CREATED)
        .json({ message: 'User registered successfully', user });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: any, res: any, next: NextFunction) {
    const user: createAuthDTO = req.body;
    try {
      const result = await authRepository.login(user);
      res.status(httpStatus.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllAuth(req: any, res: any) {
    try {
      const auth = await Auth.findAll();
      if (!auth.length)
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'No users exist' });
      return res.status(httpStatus.OK).json(auth);
    } catch (err) {
      return res.json({ error: 'There is no user exist!' });
    }
  }
}

export const authController = new AuthController();

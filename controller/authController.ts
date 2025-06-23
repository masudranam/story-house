import { NextFunction, Response, Request } from 'express';

import { Auth } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { authService } from '../services/authService.ts';
import { responseFormatter } from '../utils/responseFormatteUtils.ts';

export class AuthController {
  async signUpUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.signUpUser(req.body);
      responseFormatter.format(req, res,{
      message: 'User registered successfully', user: user
      }, httpStatus.CREATED)
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginUser(req.body);
      responseFormatter.format(req, res, result, httpStatus.OK);
    } catch (err) {
      next(err);
    }
  }

  async getAllAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const auth = await Auth.findAll();
      if (!auth.length){
        responseFormatter.format(req, res,{error: 'No users exist'}, httpStatus.NOT_FOUND);
      }else{
        responseFormatter.format(req, res, auth, httpStatus.OK);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

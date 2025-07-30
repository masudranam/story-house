import { NextFunction, Response, Request } from 'express';

import { Auth } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { authService } from '../services/authService.ts';
import { responseFormatter } from '../utils/responseFormatteUtils.ts';
import { userRequest } from '../dto/user/userRequest.ts';

export class AuthController {
  async signUpUser(req: userRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.signUpUser(req.body);
      responseFormatter.format(
        req,
        res,
        {
          message: 'User registered successfully',
          user: user,
        },
        httpStatus.CREATED,
      );
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: userRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginUser(req.body);
      responseFormatter.format(req, res, result, httpStatus.OK);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: userRequest, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId){
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }

      const result = await authService.changePassword(userId, oldPassword, newPassword);
      responseFormatter.format(req, res,result,httpStatus.OK)
    } catch (err) {
      next(err);
    }
  }

  async getAllAuth(req: userRequest, res: Response, next: NextFunction) {
    try {
      const auth = await Auth.findAll();
      if (!auth.length) {
        responseFormatter.format(
          req,
          res,
          { error: 'No users exist' },
          httpStatus.NOT_FOUND,
        );
      } else {
        responseFormatter.format(req, res, auth, httpStatus.OK);
      }
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

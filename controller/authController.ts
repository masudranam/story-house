import { Auth } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { NextFunction } from 'express';
import { authService } from '../services/authService.ts';
import { signUpUserSchema } from '../dto/signupUserDTO.ts';
import { loginUserDTO, loginUserSchema } from '../dto/loginUserDTO.ts';

class AuthController {
  async signUpUser(req: any, res: any, next: NextFunction) {
    try {
      const parsed = signUpUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ errors: parsed.error.errors });
      }

      const user = await authService.signUpUser(req.body);
      return res
        .status(httpStatus.CREATED)
        .json({ message: 'User registered successfully', user });
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: any, res: any, next: NextFunction) {
    try {
      const user: loginUserDTO = req.body;
      const parsed = loginUserSchema.parse(req.body);
      const result = await authService.loginUser(parsed);
      return res.status(httpStatus.OK).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getAllAuth(req: any, res: any, next: NextFunction) {
    try {
      const auth = await Auth.findAll();
      if (!auth.length)
        return res
          .status(httpStatus.NOT_FOUND)
          .json({ error: 'No users exist' });
      return res.status(httpStatus.OK).json(auth);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();

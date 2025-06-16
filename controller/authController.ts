import { Auth } from '../database/database.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { NextFunction, Response, Request } from 'express';
import { authService } from '../services/authService.ts';
import { signUpUserDTO, signUpUserSchema } from '../dto/signupUserDTO.ts';
import { loginUserDTO, loginUserSchema } from '../dto/loginUserDTO.ts';

class AuthController {
  async signUpUser(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = signUpUserSchema.safeParse(req.body);
      if (!parsed.success) {
        res
          .status(httpStatus.BAD_REQUEST)
          .json({ errors: parsed.error.errors });
        return;
      }
      const user = await authService.signUpUser(req.body);
      res
        .status(httpStatus.CREATED)
        .json({ message: 'User registered successfully', user });
      return;
    } catch (err) {
      next(err);
    }
  }

  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user: loginUserDTO = req.body;
      const parsed = loginUserSchema.parse(req.body);
      const result = await authService.loginUser(parsed);
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

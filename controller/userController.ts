import { NextFunction, Request, Response } from 'express';
import { userService } from '../services/userService.ts';
import { userRepository } from '../repository/userRepository.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { createUserDTO } from '../dto/DTO.ts';

class UserController {
  async createUser(req: any, res: any, next: NextFunction) {
    try {
      const user: createUserDTO = req.body;
      const result = await userRepository.createUser(user);
      res.status(httpStatus.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.getUserById(req.params.id);
      user
        ? res.json(user)
        : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      next(err);
    }
  }

  async getUserByUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.params.username;
      const user = await User.findOne({ where: { username } });
      user
        ? res.json(user)
        : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userRepository.getAllUser();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async updateUsernameById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userRepository.getUserById(req.params.id);
      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        return;
      }

      const tokenUsername = (req as any).user.username;
      if (user.username != tokenUsername) {
        res.status(httpStatus.FORBIDDEN).json({ message: 'This is not you!' });
        return;
      }
      const newUsername = req.body.username;
      const token = await userService.updateUserName(
        tokenUsername,
        newUsername,
      );
      res.json({ message: 'Username updated', token });
    } catch (err) {
      next(err);
    }
  }

  async deleteUserById(req: any, res: any, next: NextFunction) {
    try {
      const user = await userRepository.getUserById(req.params.id);
      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not exist' });
        return;
      }

      const usernameFromToken = (req as any).user.username;
      const username = user.username;
      if (username != usernameFromToken) {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: 'You are Unauthorized to delete' });
      }

      await User.destroy({ where: { username } });
      await Auth.destroy({ where: { username } });
      res.status(httpStatus.OK).json({ message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();

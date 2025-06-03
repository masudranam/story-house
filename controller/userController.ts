// controllers/user.controller.ts
import { NextFunction, Request, Response } from 'express';
import { userService } from '../services/userService.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';

class UserController {
  async createUser(req: any, res: any, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(httpStatus.CREATED).json(user);
    } catch (err) {
      next(err);
      // res
      //   .status(httpStatus.INTERNAL_SERVER_ERROR)
      //   .json({ error: 'Failed to create user' });
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
      user
        ? res.json(user)
        : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      next(err);
      // res
      //   .status(httpStatus.INTERNAL_SERVER_ERROR)
      //   .json({ error: 'Failed to get user' });
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
      // res
      //   .status(httpStatus.INTERNAL_SERVER_ERROR)
      //   .json({ error: 'Failed to get user' });
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUser();
      res.json(users);
    } catch (err) {
      next(err);
      // res
      //   .status(httpStatus.INTERNAL_SERVER_ERROR)
      //   .json({ error: 'Failed to get users' });
    }
  }

  async updateUsernameById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
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
      // res
      //   .status(httpStatus.BAD_REQUEST)
      //   .json({ message: 'Cannot update username' });
    }
  }

  async deleteUserById(req: any, res: any, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
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
      // return res
      //   .status(httpStatus.INTERNAL_SERVER_ERROR)
      //   .json({ error: 'Failed to delete user' });
    }
  }
}

export const userController = new UserController();

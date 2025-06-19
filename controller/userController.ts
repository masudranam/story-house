import { NextFunction, Request, Response } from 'express';

import { userService } from '../services/userService.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';

class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);
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
      const user = await userService.getUserByUsername(username);
      user
        ? res.json(user)
        : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      next(err);
    }
  }

  async updateUsernameById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        return;
      }

      const curUsername = user.username;
      const newUsername = req.body.username;
      if (!curUsername) throw new Error('no new username provided');

      await userService.updateUserName(curUsername, newUsername);
      res.json({
        message: `username updated from ${curUsername} to ${newUsername}`,
      });
      return;
    } catch (err) {
      next(err);
    }
  }

  async deleteUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(req.params.id);

      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not exist' });
        return;
      }
      await userService.deleteUserById(user.id);
      res
        .status(httpStatus.OK)
        .json({ message: `User with id ${user.id} deleted successfully` });
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUser(req.query);
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async deleteAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      await User.destroy({ where: {}, truncate: true });
      await Auth.destroy({ where: {}, truncate: true, restartIdentity: true });
      res.status(httpStatus.OK).json({ message: 'All users deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();

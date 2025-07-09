import { NextFunction, Request, Response } from 'express';

import { userService } from '../services/userService.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { responseFormatter } from '../utils/responseFormatteUtils.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';
import { Op, Sequelize } from 'sequelize';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user: userAttributes = await userService.getUserById(req.params.id);
      // user
      //   ? res.status(httpStatus.OK).json(user)
      //   : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
      if (user) {
        responseFormatter.format(req, res, user, httpStatus.OK);
      } else {
        responseFormatter.format(
          req,
          res,
          { error: 'User not found' },
          httpStatus.NOT_FOUND,
        );
      }
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
      const user: userAttributes = await userService.getUserById(req.params.id);

      if (!user?.id) {
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

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.searchUser(req.query);
      responseFormatter.format(req, res, users, httpStatus.OK);
    } catch (err) {
      next(err);
    }
  }


async deleteAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
 
    const admins = await User.findAll({ where: { role: { [Op.eq]: 1 } } });
 
    const adminIds = admins.map(admin => admin.id);
 
    await User.destroy({ where: { role: { [Op.ne]: 1 } } });

  
    await Auth.destroy({
      where: { userId: { [Op.notIn]: adminIds } },
      restartIdentity: true,
    });

    res.status(httpStatus.OK).json({ message: 'All non-admin users deleted' });
  } catch (err) {
    next(err);
  }
}

}

export const userController = new UserController();

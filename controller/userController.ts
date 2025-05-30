// controllers/user.controller.ts
import { Request, Response } from 'express';
import { userService } from '../services/userService.ts';
import { httpStatus } from '../utils/httpStatus.ts';
const userservice = new userService();

 class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const user = await userservice.createUser(req.body);
      res.status(httpStatus.CREATED).json(user);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to create user' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userservice.getUserById(req.params.id);
      user ? res.json(user) : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get user' });
    }
  }

  async getAllUsers(_: Request, res: Response) {
    try {
      const users = await userservice.getAllUser();
      res.json(users);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to get users' });
    }
  }

  async updateUserById(req: Request, res: Response) {
    try {
      const user = await userservice.updateUser(req.params.id, req.body);
      user ? res.json(user) : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to update user' });
    }
  }

  async deleteUserById(req: Request, res: Response) {
    try {
      const deleted = await userservice.deleteUser(req.params.id);
      deleted
        ? res.json({ message: 'Deleted' })
        : res.status(httpStatus.NOT_FOUND).json({ error: 'User not found' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed to delete user' });
    }
  }
}

export const userController = new UserController();
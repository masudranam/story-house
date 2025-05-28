// controllers/user.controller.ts
import { Request, Response } from 'express';
import { userService } from '../services/user';

export class userController {
  static async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      user ? res.json(user) : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  static async getAllUsers(_: Request, res: Response) {
    try {
      const users = await userService.getAllUser();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  static async updateUserById(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      user ? res.json(user) : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  static async deleteUserById(req: Request, res: Response) {
    try {
      const deleted = await userService.deleteUser(req.params.id);
      deleted
        ? res.json({ message: 'Deleted' })
        : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

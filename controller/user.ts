// controllers/user.controller.ts
import { Request, Response } from 'express';
import { userService } from '../services/user';
const userservice = new userService();

export class userController {
  async createUser(req: Request, res: Response) {
    try {
      const user = await userservice.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userservice.getUserById(req.params.id);
      user ? res.json(user) : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }

  async getAllUsers(_: Request, res: Response) {
    try {
      const users = await userservice.getAllUser();
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get users' });
    }
  }

  async updateUserById(req: Request, res: Response) {
    try {
      const user = await userservice.updateUser(req.params.id, req.body);
      user ? res.json(user) : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  async deleteUserById(req: Request, res: Response) {
    try {
      const deleted = await userservice.deleteUser(req.params.id);
      deleted
        ? res.json({ message: 'Deleted' })
        : res.status(404).json({ error: 'User not found' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
}

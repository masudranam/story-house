import { Request, Response } from 'express';
import * as UserService from '../services/user.service';

export const createUser = async (req: Request, res: Response) => {
  const user = await UserService.create(req.body);
  res.status(201).json(user);
};

export const getUser = async (req: Request, res: Response) => {
  const user = await UserService.getOne(req.params.id);
  user ? res.json(user) : res.status(404).json({ error: 'User not found' });
};

export const getUsers = async (_: Request, res: Response) => {
  const users = await UserService.getAll();
  res.json(users);
};

export const updateUser = async (req: Request, res: Response) => {
  const user = await UserService.update(req.params.id, req.body);
  user ? res.json(user) : res.status(404).json({ error: 'User not found' });
};

export const deleteUser = async (req: Request, res: Response) => {
  const deleted = await UserService.remove(req.params.id);
  deleted
    ? res.json({ message: 'Deleted' })
    : res.status(404).json({ error: 'User not found' });
};

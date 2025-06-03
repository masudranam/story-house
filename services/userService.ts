import { userRepository } from '../repository/userRepository.ts';
import { Auth } from '../database/models/auth.ts';
import { User } from '../database/models/user.ts';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
dotenv.config();

class UserService {
  async createUser(data: any) {
    try {
      return await User.create(data);
    } catch (err) {
       throw new Error(`Failed to create ${err}`);
    }
  }

  async getUserById(id: string ) {
    try {
      return await User.findByPk(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
    }
  }

  async getAllUser( ) {
    try {
      return await User.findAll();
    } catch (err) {
      throw new Error('User not found for all user');
    }
  }

  async updateUserName(curUsername: string, newUsername: string) {
    if (!newUsername) throw new Error('New username required');
    const exist = await Auth.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('User new user already exist');

    await User.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );
    await Auth.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );

    const SECRET = (process.env.JWT_SECRET as string) || 'secret';
    const newToken = jwt.sign({ username: newUsername }, SECRET, {
      expiresIn: '2d',
    });
    return newToken;
  }

  async deleteUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  async deleteUser(id: string) {
    try {
      return await User.destroy({ where: { id } });
    } catch (err) {
      throw new Error('User not found for delete');
    }
  }
}

export const userService = new UserService();

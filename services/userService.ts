import { Auth } from '../database/models/auth.ts';
import { User } from '../database/models/user.ts';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repository/userRepository.ts';
dotenv.config();

class UserService {
  async getUserById(id: string) {
    try {
      return await userRepository.getUserById(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
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
    return;
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

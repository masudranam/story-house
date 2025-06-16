import { Auth } from '../database/models/auth.ts';
import { User } from '../database/models/user.ts';
import dotenv from 'dotenv';
import { userRepository } from '../repository/userRepository.ts';
import { authRepository } from '../repository/authRepository.ts';
import { sequelize } from '../database/database.ts';
dotenv.config();

class UserService {
  async getUserById(id: string) {
    try {
      return await userRepository.getUserById(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
    }
  }

  async getAllUser(query: any) {
    try {
      const filters: any = {};
      if (query.name) filters.name = query.name;
      if (query.username) filters.username = query.username;

      return await userRepository.getAllUser(filters);
    } catch (err) {
      throw new Error('User not found');
    }
  }

  async updateUserName(curUsername: string, newUsername: string) {
    if (!newUsername) throw new Error('New username required');
    const exist = await Auth.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('user already exist');

    await authRepository.updateUserName(curUsername, newUsername);
    return;
  }

  async deleteUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  async deleteUserById(user: any) {
    const transaction = await sequelize.transaction();
    try {
      await userRepository.deleteUserById(user.id, transaction);
      await authRepository.deleteAuthByUsername(user.username, transaction);
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw new Error('User not found for delete');
    }
  }
}

export const userService = new UserService();

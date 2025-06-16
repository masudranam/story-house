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

  async getUserByUsername(username: string) {
    try {
      return await userRepository.getUserByUsername(username);
    } catch (err) {
      throw err;
    }
  }

  async updateUserName(curUsername: string, newUsername: string) {
    if (!newUsername) throw new Error('New username required');
    const transaction = await sequelize.transaction();

    try {
      await authRepository.updateUsername(
        curUsername,
        newUsername,
        transaction,
      );
      await userRepository.updateUsername(
        curUsername,
        newUsername,
        transaction,
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async deleteUserByUsername(username: string) {
    try {
      return await userRepository.deleteUserByUsername(username);
    } catch (err) {
      throw err;
    }
  }

  async deleteUserById(id: string) {
    try {
      await userRepository.deleteUserById(id);
    } catch (err) {
      throw new Error('User not found for delete');
    }
  }
}

export const userService = new UserService();

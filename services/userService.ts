import dotenv from 'dotenv';

import { userRepository } from '../repository/userRepository.ts';
import { userFilters } from '../dto/user/userFilters.ts';
dotenv.config();

class UserService {
  async getUserById(id: string) {
      return await userRepository.getUserById(id);
  }

  async getAllUser(query: userFilters) {
      const filters: userFilters = {};
      if (query.name) filters.name = query.name;
      if (query.username) filters.username = query.username;

      return await userRepository.getAllUser(filters);
  }

  async getUserByUsername(username: string) {
      return await userRepository.getUserByUsername(username);
  }

  async updateUserName(curUsername: string, newUsername: string) {
    if (!newUsername) throw new Error('New username required');
      await userRepository.updateUsername(curUsername, newUsername);
  }

  async deleteUserByUsername(username: string) {
      return await userRepository.deleteUserByUsername(username);
  }

  async deleteUserById(id: string) {
      await userRepository.deleteUserById(id);
  }
}

export const userService = new UserService();

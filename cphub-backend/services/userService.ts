import dotenv from 'dotenv';

import { userRepository } from '../repository/userRepository.ts';
import { userFilters } from '../dto/user/userFilters.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';
dotenv.config();

class UserService {
  async getUserById(id: string) {
    return await userRepository.getUserById(id);
  }

async searchUsers(query: userFilters): Promise<{ count: number; rows: userAttributes[] }> {
  const filters: userFilters =query;
  if (query.search) {
    filters.username = query.search;
    filters.email = query.search;
  }

  if(query.role !== undefined){
    filters.role = query.role;
  }
 
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 5;
  const offset = (page - 1) * limit;

  return await userRepository.searchUsers(filters, limit, offset);
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

  async getAllStates() {
    return await userRepository.getAllStates();
  }
}

export const userService = new UserService();

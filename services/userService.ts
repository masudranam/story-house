import {userRepository  } from '../repository/userRepository.ts';
 

export class userService {
  async createUser(data: any) {
    try {
      return await userRepository.createUser(data);
    } catch (err) {
      throw new Error(`Failed to create ${err}`);
    }
  }

  async getUserById(id: string) {
    try {
      return await userRepository.getUserById(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
    }
  }

  async getAllUser() {
    try {
      return await userRepository.getAllUsers();
    } catch (err) {
      throw new Error('User not found for all user');
    }
  }

  async updateUser(id: string, data: any) {
    try {
      return await userRepository.updateUserById(id, data);
    } catch (err) {
      throw new Error('User not found for update');
    }
  }

  async deleteUser(id: string) {
    try {
      return await userRepository.deleteUserById(id);
    } catch (err) {
      throw new Error('User not found for delete');
    }
  }
}

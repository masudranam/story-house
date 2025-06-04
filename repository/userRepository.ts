// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { createUserDTO } from '../dto/DTO.ts';

class UserRepository {
  async createUser(data: createUserDTO) {
    try {
      const { name, username, email } = data;
      return await User.create({ name, username, email });
    } catch (err) {
      throw new Error(`Failed to create ${err}`);
    }
  }

  async getUserById(id: string) {
    try {
      return await User.findByPk(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
    }
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  async deleteUser(id: string) {
    try {
      return await User.destroy({ where: { id } });
    } catch (err) {
      throw new Error('User not found for delete');
    }
  }

  async getAllUser() {
    try {
      return await User.findAll();
    } catch (err) {
      throw new Error('User not found for all user');
    }
  }
}

export const userRepository = new UserRepository();

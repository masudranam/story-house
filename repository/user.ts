// repositories/user.repository.ts
import { User } from '../database/models/user';

export class userRepository {
  static async createUser(data: Partial<User>) {
    return await User.create(data);
  }

  static async getUserById(id: string) {
    return await User.findByPk(id);
  }

  static async getAllUsers() {
    return await User.findAll();
  }

  static async updateUserById(id: string, data: Partial<User>) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

  static async deleteUserById(id: string) {
    return await User.destroy({ where: { id } });
  }
};

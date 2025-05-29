// repositories/user.repository.ts
import { User } from '../database/models/user';

export class userRepository {
   async createUser(data: Partial<User>) {
    return await User.create(data);
  }

   async getUserById(id: string) {
    return await User.findByPk(id);
  }

   async getAllUsers() {
    return await User.findAll();
  }

   async updateUserById(id: string, data: Partial<User>) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(data);
  }

   async deleteUserById(id: string) {
    return await User.destroy({ where: { id } });
  }
};

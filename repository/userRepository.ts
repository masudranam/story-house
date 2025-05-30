// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';

 class UserRepository {
  async createUser(data: Partial<User>) {
    return await User.create(data);
  }
  
  async createAuth(data: any){
  return await Auth.create(data);
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
  async findUserByUserName(userName: string){
    return await User.findOne({where : {userName}});
  }
}

export const userRepository = new UserRepository();
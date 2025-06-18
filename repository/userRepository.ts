// repositories/user.repository.ts
import { Op, WhereOptions } from 'sequelize';
import { User } from '../database/models/user.ts';
import { signUpUser } from '../dto/signupUserDTO.ts';
import { userFilters } from '../dto/userFilters.ts';

class UserRepository {
  async findUserByIdentifier(user: Partial<signUpUser>) {
    return await User.findOne({
      where: {
        [Op.or]: [{ username: user.username }, { email: user.email }],
      },
    });
  }

  async updateUsername(curUsername: string, newUsername: string) {
    const exist = await User.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('User new user already exist');

    return await User.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );
  }

  async getUserById(id: string) {
      return await User.findByPk(id);
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  async deleteUserByUsername(username: string) {}

  async deleteUserById(id: string) {
      return await User.destroy({ where: { id } });
  }

  async getAllUser(filters: userFilters) {
      

      const where: WhereOptions = {};
      if (filters.name) {
        where.name = { [Op.iLike]: `%${filters.name}%` };
      }
      if (filters.username) {
        where.username = { [Op.iLike]: `%${filters.username}%` };
      } 
      return await User.findAll({where});
  }
}

export const userRepository = new UserRepository();

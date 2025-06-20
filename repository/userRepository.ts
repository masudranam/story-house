import { Op, WhereOptions } from 'sequelize';

import { User } from '../database/models/user.ts';
import { signUpUser } from '../dto/auth/signupUserDTO.ts';
import { userFilters } from '../dto/user/userFilters.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';

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
    const user: userAttributes = await User.findByPk(id);
    return user;
  }

  async getUserByUsername(username: string) {
    const user: userAttributes = await User.findOne({ where: { username } });
    return user;
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
    const users: userAttributes[] = await User.findAll({ where });
    return users;
  }
}

export const userRepository = new UserRepository();

// repositories/user.repository.ts
import { Op, Transaction } from 'sequelize';
import { User } from '../database/models/user.ts';
import { signUpUserDTO } from '../dto/signupUserDTO.ts';

class UserRepository {
  async findUserByIdentifier(user: Partial<signUpUserDTO>) {
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
    try {
      return await User.findByPk(id);
    } catch (err) {
      throw new Error(`Not found user id ${id}`);
    }
  }

  async getUserByUsername(username: string) {
    return await User.findOne({ where: { username } });
  }

  async deleteUserByUsername(username: string) {}

  async deleteUserById(id: string) {
    try {
      return await User.destroy({ where: { id } });
    } catch (err) {
      throw new Error('User not found for delete');
    }
  }

  async getAllUser(filters: any) {
    try {
      const where: any = {};
      if (filters.name) {
        where.name = { [Op.iLike]: `%${filters.name}%` };
      }
      if (filters.username) {
        where.username = { [Op.iLike]: `%${filters.username}%` };
      }
      return await User.findAll({ where });
    } catch (err) {
      throw new Error('User not found for all user');
    }
  }
}

export const userRepository = new UserRepository();

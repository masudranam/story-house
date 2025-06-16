// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { Op, Transaction } from 'sequelize';
import { createAuthDTO } from '../dto/createAuthDTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import { sequelize } from '../database/database.ts';

class AuthRepository {
  async createAuth(data: createAuthDTO) {
    const username = data.username;
    const password = data.password;
    const hashed = await securePassword.hashedPassword(password);
    return await Auth.create({ username, password: hashed });
  }

  async findUserByIdentifier(identifier: string) {
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username: identifier }, { email: identifier }],
      },
    });
    return user;
  }

  async deleteAuthByUsername(username: any, transaction: Transaction) {
    try {
      return await Auth.destroy({ where: { username }, transaction });
    } catch (err) {
      throw new Error('Auth not found for deleted');
    }
  }

  async findAuthByUsername(username: string) {
    const auth = await Auth.findOne({
      where: { username: username },
    });
    return auth;
  }

  async updateUserName(curUsername: string, newUsername: string) {
    if (!newUsername) throw new Error('New username required');
    const exist = await Auth.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('User new user already exist');

    const transaction = await sequelize.transaction();
    try {
      await User.update(
        { username: newUsername },
        { where: { username: curUsername }, transaction },
      );
      await Auth.update(
        { username: newUsername },
        { where: { username: curUsername }, transaction },
      );
      await transaction.commit();
      return;
    } catch (err) {
      await transaction.rollback();
      throw new Error('Failled to update username');
    }
  }
}

export const authRepository = new AuthRepository();

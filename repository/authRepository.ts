// repositories/user.repository.ts
import { Auth } from '../database/models/auth.ts';
import { Transaction } from 'sequelize';
import { createAuthDTO } from '../dto/createAuthDTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';

class AuthRepository {
  async createAuth(data: createAuthDTO, transaction: Transaction) {
    const username = data.username;
    const password = data.password;
    const hashed = await securePassword.hashedPassword(password);
    return await Auth.create({ username, password: hashed });
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

  async updateUsername(curUsername: string, newUsername: string, options = {}) {
    const exist = await Auth.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('User new user already exist');

    return await Auth.update(
      { username: newUsername },
      { where: { username: curUsername }, ...options },
    );
  }
}

export const authRepository = new AuthRepository();

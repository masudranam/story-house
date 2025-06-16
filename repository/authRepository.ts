// repositories/user.repository.ts
import { Auth } from '../database/models/auth.ts';
import { Transaction } from 'sequelize';
import { securePassword } from '../utils/hashedPassword.ts';
import { User } from '../database/models/user.ts';
import { signUpUserDTO } from '../dto/signupUserDTO.ts';
import { sequelize } from '../database/database.ts';
import { createUserDTO } from '../dto/createUserDTO.ts';

class AuthRepository {
  async createUserWithAuth(user: signUpUserDTO) {
    const userData: createUserDTO = user;

    const password = user.password;
    const hashed = await securePassword.hashedPassword(password);

    const res = await sequelize.transaction(async (t) => {
      const createdUser = await User.create(userData, { transaction: t });
      const userId = createdUser.id;
      await Auth.create({ userId, password: hashed }, { transaction: t });
      return createdUser;
    });
    return res;
  }

  async deleteAuthByUsername(username: any, transaction: Transaction) {
    try {
      return await Auth.destroy({ where: { username }, transaction });
    } catch (err) {
      throw new Error('Auth not found for deleted');
    }
  }

  async findAuthByUserId(userId: string) {
    const auth = await Auth.findOne({
      where: { userId },
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

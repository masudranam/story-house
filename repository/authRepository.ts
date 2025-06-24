
import { Auth } from '../database/models/auth.ts';
import { passwordHandler } from '../utils/hashedPassword.ts';
import { User } from '../database/models/user.ts';
import { signUpUser } from '../dto/auth/signupUserDTO.ts';
import { sequelize } from '../database/database.ts';
import { createUser } from '../dto/auth/createUserDTO.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';

class AuthRepository {
  async createUserWithAuth(user: signUpUser): Promise<userAttributes> {
    const userData: createUser = user;

    const password = user.password;
    const hashed = await passwordHandler.hashedPassword(password);

    const res = await sequelize.transaction(async (t) => {
      const createdUser: userAttributes = await User.create(userData, {
        transaction: t,
      });
      const userId = createdUser.id;
      await Auth.create({ userId, password: hashed }, { transaction: t });
      return createdUser;
    });
    return res;
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

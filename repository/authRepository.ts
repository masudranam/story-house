// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import { createAuthDTO } from '../dto/createAuthDTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';

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

    await User.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );
    await Auth.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );

    const SECRET = (process.env.JWT_SECRET as string) || 'secret';
    const newToken = jwt.sign({ username: newUsername }, SECRET, {
      expiresIn: '30s',
    });
    return newToken;
  }
}

export const authRepository = new AuthRepository();

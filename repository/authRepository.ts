// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';
import jwt from 'jsonwebtoken';
import { createAuthDTO } from '../dto/DTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import { generateToken } from '../utils/jwtHandler.ts';

class AuthRepository {
  async createAuth(data: createAuthDTO) {
    const username = data.username;
    const password = data.password;
    const hashed = await securePassword.hashedPassword(password);
    return await Auth.create({ username, password: hashed });
  }

  async login(user: createAuthDTO) {
    const auth = await Auth.findOne({ where: { username: user.username } });
    if (!auth) throw new Error("User doesn't exist");

    const isMatched = await securePassword.comparePassword(
      user.password,
      auth.password,
    );

    if (!isMatched) throw new Error('Invalid Credentials');

    const token = generateToken(user.username);

    return { message: 'Login seccessful', token: `Bearer ${token}` };
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

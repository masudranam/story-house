import { userRepository } from '../repository/userRepository.ts';
import { User } from '../database/database.ts';
import { authRepository } from '../repository/authRepository.ts';
import { createUserDTO, createAuthDTO } from '../dto/DTO.ts';
import { signUpUserDTO } from '../dto/signupUserDTO.ts';
import { Op } from 'sequelize';
import { loginUserDTO } from '../dto/loginUserDTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import { generateToken } from '../utils/jwtHandler.ts';

class AuthService {
  async signUpUser(user: signUpUserDTO) {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: user.username }, { email: user.email }],
      },
    });
    console.log(existingUser);
    if (existingUser) throw new Error('username or email already exist');

    const authData: createAuthDTO = user;
    const userData: createUserDTO = user;

    await authRepository.createAuth(authData);
    await userRepository.createUser(userData);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async loginUser(data: loginUserDTO) {
    const user = await authRepository.findUserByIdentifier(data.identifier);
    if (!user) throw new Error('Invalid credentials');

    const auth = await authRepository.findAuthByUsername(user.username);

    if (!auth) throw new Error('Invalid credentials');

    const isMatch = await securePassword.comparePassword(
      data.password,
      auth.password,
    );

    if (!isMatch) throw new Error('invalid credentials');

    const token = generateToken(user.id, user.role);

    return { message: 'Login seccessful', token: `Bearer ${token}` };
  }
}

export const authService = new AuthService();

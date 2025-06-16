import { userRepository } from '../repository/userRepository.ts';
import { sequelize } from '../database/database.ts';
import { authRepository } from '../repository/authRepository.ts';
import { createUserDTO, createAuthDTO } from '../dto/DTO.ts';
import { signUpUserDTO } from '../dto/signupUserDTO.ts';
import { loginUserDTO } from '../dto/loginUserDTO.ts';
import { securePassword } from '../utils/hashedPassword.ts';
import { generateToken } from '../utils/jwtHandler.ts';

class AuthService {
  async signUpUser(user: signUpUserDTO) {
    const existingUser = await userRepository.findUserByIdentifier(user);

    if (existingUser) throw new Error('username or email already exist');

    const authData: createAuthDTO = user;
    const userData: createUserDTO = user;

    const transaction = await sequelize.transaction();
    try {
      await authRepository.createAuth(authData, transaction);
      await userRepository.createUser(userData, transaction);

      await transaction.commit();
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  async loginUser(data: loginUserDTO) {
    const user = await userRepository.findUserByIdentifier(data.identifier);

    if (!user) throw new Error("User doesn't exist!");

    const auth = await authRepository.findAuthByUsername(user.username);

    if (!auth) throw new Error("User doesn't exist");

    const isMatch = await securePassword.comparePassword(
      data.password,
      auth.password,
    );

    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken(user.id, user.role);

    return { message: 'Login seccessful', token: `Bearer ${token}` };
  }
}

export const authService = new AuthService();

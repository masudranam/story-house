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
    try {
      const existingUser = await userRepository.findUserByIdentifier(user);
      if (existingUser) throw new Error('username or email already exist');

      await authRepository.createUserWithAuth(user);

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (err) {
      throw err;
    }
  }

  async loginUser(data: loginUserDTO) {
    const curData: Partial<signUpUserDTO> = {
      email: data.identifier,
      username: data.identifier,
    };

    const user = await userRepository.findUserByIdentifier(curData);

    if (!user) throw new Error("User doesn't exist!");

    const auth = await authRepository.findAuthByUserId(user.id);

    const isMatch = await securePassword.comparePassword(
      data.password,
      auth!.password,
    );

    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken(user.id, user.role);

    return { message: 'Login seccessful', token: `Bearer ${token}` };
  }
}

export const authService = new AuthService();

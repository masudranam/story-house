import { userRepository } from '../repository/userRepository.ts';
import { authRepository } from '../repository/authRepository.ts';
import { signUpUser } from '../dto/auth/signupUserDTO.ts';
import { loginUser } from '../dto/auth/loginUserDTO.ts';
import { passwordHandler } from '../utils/hashedPassword.ts';
import { generateToken } from '../utils/jwtHandler.ts';

class AuthService {
  async signUpUser(user: signUpUser) {
      const existingUser = await userRepository.findUserByIdentifier(user);
      if (existingUser) throw new Error('username or email already exist');

      const createdUser = await authRepository.createUserWithAuth(user);

      return createdUser;
  }

  async loginUser(data: loginUser) {
    const curData: Partial<signUpUser> = {
      email: data.identifier,
      username: data.identifier,
    };

    const user = await userRepository.findUserByIdentifier(curData);

    if (!user) throw new Error("User doesn't exist!");

    const auth = await authRepository.findAuthByUserId(user.id);

    const isMatch = await passwordHandler.comparePassword(
      data.password,
      auth!.password,
    );

    if (!isMatch) throw new Error('Invalid credentials');

    const token = generateToken(user.id, user.role);

    return { message: 'Login seccessful', token: `Bearer ${token}` };
  }
}

export const authService = new AuthService();

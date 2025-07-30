import { userRepository } from '../repository/userRepository.ts';
import { authRepository } from '../repository/authRepository.ts';
import { signUpUser } from '../dto/auth/signupUserDTO.ts';
import { loginUser } from '../dto/auth/loginUserDTO.ts';
import { passwordHandler } from '../utils/passwordHandler.ts';
import { generateToken } from '../utils/jwtHandler.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';

export class AuthService {
  async signUpUser(user: signUpUser): Promise<userAttributes> {
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
    const token = generateToken(user.id,user.username, user.role);

    return { message: 'Login seccessful', username: user.username, token: `Bearer ${token}` };
  }

async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const auth = await authRepository.findAuthByUserId(userId);

    if (!auth) throw new Error('User auth  not found');

    const match = await passwordHandler.comparePassword(oldPassword, auth.password); 

    if (!match) throw new Error('Old password is incorrect');

    const sameAsOld = await passwordHandler.comparePassword(newPassword, auth.password);
    if (sameAsOld) throw new Error('New password must differ from old one');

    const hashed = await passwordHandler.hashedPassword(newPassword);
    await authRepository.updatePassword(userId, hashed);

    return { message: 'Password changed successfully' };
  }
  
}

export const authService = new AuthService();

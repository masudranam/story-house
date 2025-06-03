import { userRepository } from '../repository/userRepository.ts';
import { User } from '../database/database.ts';
import { signUpUserDTO } from '../dto/DTO.ts';
import { authRepository } from '../repository/authRepository.ts';
import { createUserDTO, createAuthDTO } from '../dto/DTO.ts';

export const registerUserService = async (user: signUpUserDTO) => {
  const existingUser = await User.findOne({
    where: { username: user.username },
  });
  if (existingUser) throw new Error('User already exist');

  const authData: createAuthDTO = user;
  const userData: createUserDTO = user;

  await authRepository.createAuth(authData);
  await userRepository.createUser(userData);

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

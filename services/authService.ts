import { userRepository } from '../repository/userRepository.ts';
import bcrypt from 'bcrypt';
import { httpStatus } from '../utils/httpStatus.ts';

export const registerUserService = async (body: any) => {
  const { name, username, email, password } = body;

  const existingUser = await userRepository.findUserByUserName(username);
  if (existingUser) {
    return { success: false, status: httpStatus.CONFLICT, message: 'User already exists' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({ name, email, username
   });
  await userRepository.createAuth({ username, password: hashed });

  return { success: true, status: httpStatus.CREATED, message: 'User registered', user };
};

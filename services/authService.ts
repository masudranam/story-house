import { userRepository } from '../repository/userRepository.ts';
import bcrypt from 'bcrypt';
import { httpStatus } from '../utils/httpStatus.ts';

export const registerUserService = async (body: any) => {
  const { name, userName, email, password } = body;

  const existingUser = await userRepository.findUserByUserName(userName);
  if (existingUser) {
    return { success: false, status: httpStatus.CONFLICT, message: 'User already exists' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({ name, email, userName });
  await userRepository.createAuth({ userName, password: hashed });

  return { success: true, status: httpStatus.CREATED, message: 'User registered', user };
};

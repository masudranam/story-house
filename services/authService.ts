import { userRepository } from '../repository/userRepository.ts';
 
import bcrypt from 'bcrypt';

export const registerUserService = async (body: any) => {
  const { name, email, userName, password } = body;

  const existingUser = await userRepository.findUserByUserName(userName);
  if (existingUser) {
    return { success: false, status: 409, message: 'User already exists' };
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({ name, email, userName });
  await userRepository.createAuth({ userName, password: hashed });

  return { success: true, status: 201, message: 'User registered', user };
};

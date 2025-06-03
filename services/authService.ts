import { userRepository } from '../repository/userRepository.ts';
import bcrypt from 'bcrypt';
import { httpStatus } from '../utils/httpStatus.ts';
import { User } from '../database/database.ts';

export const registerUserService = async (body: any) => {
  const { name, username, email, password } = body;

  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    return {
      success: false,
      status: httpStatus.CONFLICT,
      message: 'User already exists',
    };
  }

  const hashed = await bcrypt.hash(password, 10);
  const data = { name, email, username };
  const user = await User.create(data);
  await userRepository.createAuth({ username, password: hashed });

  return {
    success: true,
    status: httpStatus.CREATED,
    message: 'User registered',
    user,
  };
};

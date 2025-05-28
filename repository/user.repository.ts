import { User } from '../databases/models/user.models.ts';

export const createUser = async (data: Partial<User>) => await User.create(data);

export const getUserById = async (id: string) => await User.findByPk(id);

export const getAllUsers = async () => await User.findAll();

export const updateUserById = async (id: string, data: Partial<User>) => {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(data);
};

export const deleteUserById = async (id: string) => {
  return await User.destroy({ where: { id } });
};

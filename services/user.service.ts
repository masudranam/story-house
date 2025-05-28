import * as UserRepo from '../repository/user.repository.ts';

export const create = (data: any) => UserRepo.createUser(data);
export const getOne = (id: string) => UserRepo.getUserById(id);
export const getAll = () => UserRepo.getAllUsers();
export const update = (id: string, data: any) =>
  UserRepo.updateUserById(id, data);
export const remove = (id: string) => UserRepo.deleteUserById(id);

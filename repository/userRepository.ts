// repositories/user.repository.ts
import { User } from '../database/models/user.ts';
import { Auth } from '../database/models/auth.ts';

class UserRepository {
  async createAuth(data: any) {
    return await Auth.create(data);
  }
}

export const userRepository = new UserRepository();

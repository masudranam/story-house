import { Op, WhereOptions } from 'sequelize';

import { User } from '../database/models/user.ts';
import { signUpUser } from '../dto/auth/signupUserDTO.ts';
import { userFilters } from '../dto/user/userFilters.ts';
import { userAttributes } from '../dto/user/userAtrributes.ts';
import { Story, Comment } from '../database/database.ts';

class UserRepository {
  async findUserByIdentifier(
    user: Partial<signUpUser>,
  ): Promise<userAttributes> {
    const result: userAttributes = await User.findOne({
      where: {
        [Op.or]: [{ username: user.username }, { email: user.email }],
      },
    });
    return result;
  }

  async updateUsername(curUsername: string, newUsername: string) {
    const exist = await User.findOne({ where: { username: newUsername } });
    if (exist) throw new Error('User new user already exist');

    return await User.update(
      { username: newUsername },
      { where: { username: curUsername } },
    );
  }

  async getUserById(id: string): Promise<userAttributes> {
    const user: userAttributes = await User.findByPk(id);
    return user;
  }

  async getUserByUsername(username: string) {
    const user: userAttributes = await User.findOne({ where: { username } });
    return user;
  }

  async deleteUserByUsername(username: string) {}

  async deleteUserById(id: string) {
    return await User.destroy({ where: { id } });
  }

async searchUsers(
  filters: userFilters,
  limit: number,
  offset: number
): Promise<{ count: number; rows: userAttributes[] }> {
  const where: WhereOptions = {};

  if (filters.username)
    where.username = { [Op.iLike]: `%${filters.username}%` };
  
  if (filters.name)
    where.username = { [Op.iLike]: `%${filters.name}%` };

  if (filters.email)
    where.email = { [Op.iLike]: `%${filters.email}%` };

  if (filters.role !== undefined)
    where.role = filters.role;

  return await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
}

  async getAllStates() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [totalUsers, newUsers, totalPosts, newPosts, totalComments] = await Promise.all([
      User.count(),
      User.count({ where: { createdAt: { [Op.gte]: oneWeekAgo } } }),
      Story.count(),
      Story.count({ where: { createdAt: { [Op.gte]: oneWeekAgo } } }),
      Comment.count(),
    ]);

    return {
      totalUsers,
      newUsersThisWeek: newUsers,
      totalPosts,
      newPostsThisWeek: newPosts,
      totalComments,
    };
  }

}

export const userRepository = new UserRepository();

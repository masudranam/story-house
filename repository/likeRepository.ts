import { Like } from "../database/database.ts";

class LikeRepository {
  async addLike(userId: string, storyId: string) {
    return await Like.create({ userId, storyId });
  }

  async removeLike(userId: string, storyId: string) {
    return await Like.destroy({ where: { userId, storyId } });
  }

  async hasLiked(userId: string, storyId: string) {
    const like = await Like.findOne({ where: { userId, storyId } });
    return !!like;
  }

  async countLikes(storyId: string) {
    return await Like.count({ where: { storyId } });
  }
}

export const likeRepository = new LikeRepository();

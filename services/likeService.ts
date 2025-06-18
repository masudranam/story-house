import { likeRepository } from '../repository/likeRepository.ts';

class LikeService {
  async likeStory(userId: string, storyId: string) {
    const alreadyLiked = await likeRepository.hasLiked(userId, storyId);
    if (alreadyLiked) throw new Error('Already liked');

    return await likeRepository.addLike(userId, storyId);
  }

  async unlikeStory(userId: string, storyId: string) {
    const alreadyLiked = await likeRepository.hasLiked(userId, storyId);
    if (!alreadyLiked) throw new Error('Not liked yet');

    return await likeRepository.removeLike(userId, storyId);
  }

  async getLikesCount(storyId: string) {
    return await likeRepository.countLikes(storyId);
  }
}

export const likeService = new LikeService();

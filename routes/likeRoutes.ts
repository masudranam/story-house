import { Router } from 'express';

import { likeController } from '../controller/likeController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
const router = Router();

router.get('/', likeController.getAllLikes);
router.post('/:storyId', authMiddleware, likeController.likeStory);
router.delete('/:storyId', authMiddleware, likeController.unlikeStory);
router.get('/:storyId', authMiddleware, likeController.getLikesCount);
router.get('/liked/:storyId', authMiddleware,likeController.hasLikedStory);

export default router;

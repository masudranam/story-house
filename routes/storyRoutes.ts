import express from 'express';

import { storyController } from '../controller/storyController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteStory } from '../middleware/canEditOrDeleteStory.ts';
const router = express.Router();

router
  .post('/', authMiddleware, storyController.postStory)
  .get('/',storyController.getStories)
  .delete('/', storyController.deleteAllStories)
  .get('/:id',authMiddleware, storyController.getStoryByStoryId)
  .delete(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    storyController.deleteStoryByStoryId,
  )
  .put(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    storyController.updateStoryByStoryId,
  );

export default router;

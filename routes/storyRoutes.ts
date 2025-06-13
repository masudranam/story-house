import express from 'express';
import { storyController } from '../controller/storyController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
import { canEditOrDeleteStory } from '../middleware/canEditOrDelete.ts';
const router = express.Router();

router
  .post('/', authMiddleware, storyController.postStory)
  .get('/', storyController.getStories)
  .delete('/', storyController.deleteAllStories)
  .get('/:id', storyController.getStoryByStoryId)
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

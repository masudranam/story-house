import express from 'express';
import { storyController } from '../controller/storyController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
const router = express.Router();

router
  .post('/', authMiddleware, storyController.postStory)
  .get('/', storyController.getStories)
  .delete('/', authMiddleware, storyController.deleteAllStories)
  .get('/:id', storyController.getStoryByStoryId)
  .delete(
    '/:id',
    authMiddleware,
    authorizeOwner,
    storyController.deleteStoryByStoryId,
  )
  .put(
    '/:id',
    authMiddleware,
    authorizeOwner,
    storyController.updateStoryByStoryId,
  );

export default router;

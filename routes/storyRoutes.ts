import express from 'express';
import { storyController } from '../controller/storyController.ts';
import { middleWare } from '../middleware/authMiddleware.ts';
const router = express.Router();

router
  .post('/', storyController.postStory)
  .get('/', storyController.getStories)
  .delete('/', storyController.deleteAllStories)
  .get('/:id', storyController.getStoryByStoryId)
  .delete(
    '/:id',
    middleWare.storyUpdateMiddleware,
    storyController.deleteStoryByStoryId,
  )
  .put(
    '/:id',
    middleWare.storyUpdateMiddleware,
    storyController.updateStoryByStoryId,
  );

export default router;

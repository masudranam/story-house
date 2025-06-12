import express from 'express';
import { storyController } from '../controller/storyController.ts';
import { storyMiddleware } from '../middleware/storyMiddleware.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
const router = express.Router();

router
 .post('/',authMiddleware, storyController.postStory)
 .get('/', storyController.getStories)
 .delete('/', storyMiddleware, storyController.deleteAllStories)
 .get('/:id', storyController.getStoryByStoryId)
 .delete('/:id',storyMiddleware,storyController.deleteStoryByStoryId)
 .put('/:id',storyMiddleware, authMiddleware, storyController.updateStoryByStoryId);

export default router;

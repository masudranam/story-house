import express from 'express';

import { storyController } from '../controller/storyController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteStory } from '../middleware/canEditOrDeleteStory.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { storySchema } from '../dto/story/storyAttributes.ts';
import { storyFiltersSchema } from '../dto/story/storyFilters.ts';
const router = express.Router();

router
  .post('/', authMiddleware, validateRequest({body: storySchema}), storyController.postStory)
  .get('/',validateRequest({params: storyFiltersSchema}), storyController.getStories)
  .delete('/', storyController.deleteAllStories)
  .get('/:id', authMiddleware, validateRequest({params: storySchema}), storyController.getStoryByStoryId)
  .delete(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    validateRequest({params: storySchema}),
    storyController.deleteStoryByStoryId,
  )
  .put(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    validateRequest({body: storySchema}),
    storyController.updateStoryByStoryId,
  );

export default router;

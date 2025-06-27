import express from 'express';

import { storyController } from '../controller/storyController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteStory } from '../middleware/canEditOrDeleteStory.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import {
  storyBodySchema,
  storyUpdateSchema,
} from '../dto/story/storyAttributes.ts';
import { storyFiltersSchema } from '../dto/story/storyFilters.ts';
import { checkUUID } from '../dto/DTO.ts';
const router = express.Router();

router
  .post(
    '/',
    authMiddleware,
    validateRequest({ body: storyBodySchema }),
    storyController.postStory,
  )
  .get(
    '/',
    validateRequest({ query: storyFiltersSchema }),
    storyController.getStories,
  )
  .delete('/', storyController.deleteAllStories)
  .get(
    '/:id',
    authMiddleware,
    validateRequest({ params: checkUUID }),
    storyController.getStoryByStoryId,
  )
  .delete(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    validateRequest({ params: checkUUID }),
    storyController.deleteStoryByStoryId,
  )
  .put(
    '/:id',
    authMiddleware,
    canEditOrDeleteStory,
    validateRequest({ body: storyUpdateSchema, params: checkUUID }),
    storyController.updateStoryByStoryId,
  );

export default router;

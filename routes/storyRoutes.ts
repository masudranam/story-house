import express from 'express';
import { storyController } from '../controller/storyController.ts';
const router = express.Router();

router
      .post('/',storyController.postStory)
      .get('/',storyController.getStories);

export default router;
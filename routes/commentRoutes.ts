import express from 'express';

import { commentController } from '../controller/commentController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteComment } from '../middleware/canEditOrDeleteComment.ts';
const router = express.Router();

router
  .post('/', authMiddleware, commentController.postComment)
  .get('/', commentController.searchComment)
  .delete('/', commentController.deleteComments)
  .delete(
    '/:id',
    authMiddleware,
    canEditOrDeleteComment,
    commentController.deleteCommentByCommentId,
  )
  .put(
    '/:id',
    authMiddleware,
    canEditOrDeleteComment,
    commentController.editCommentByCommentId,
  );

export default router;

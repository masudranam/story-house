import express from 'express';

import { commentController } from '../controller/commentController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteComment } from '../middleware/canEditOrDeleteComment.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { commentSchema } from '../dto/comment/commentAttributes.ts';
import { searchCommentParamsSchema } from '../dto/comment/searchCommentParams.ts';
const router = express.Router();

router
  .post('/', authMiddleware, validateRequest({body: commentSchema}), commentController.postComment)
  .get('/',validateRequest({params: searchCommentParamsSchema}), commentController.searchComment)
  .delete('/', commentController.deleteAllComments)
  .delete(
    '/:id',
    authMiddleware,
    canEditOrDeleteComment,
    validateRequest({body: commentSchema}), commentController.deleteCommentByCommentId,
  )
  .put(
    '/:id',
    authMiddleware,
    canEditOrDeleteComment,
    validateRequest({body: commentSchema}), commentController.editCommentByCommentId,
  );

export default router;

import express from 'express';

import { commentController } from '../controller/commentController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { canEditOrDeleteComment } from '../middleware/canEditOrDeleteComment.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import {
  commentBodySchema,
  commentSchema,
} from '../dto/comment/commentAttributes.ts';
import { searchCommentParamsSchema } from '../dto/comment/searchCommentParams.ts';
import { checkUUID } from '../dto/DTO.ts';
const router = express.Router();

router
  .post(
    '/:id',
    authMiddleware,
    validateRequest({ body: commentBodySchema, params: checkUUID }),
    commentController.postComment,
  )
  .get(
    '/',
    validateRequest({ params: searchCommentParamsSchema }),
    commentController.searchComment,
  )
  .delete('/', commentController.deleteAllComments)
  .delete(
    '/:id',
    authMiddleware,
    validateRequest({ params: checkUUID }),
    canEditOrDeleteComment,
    commentController.deleteCommentByCommentId,
  )
  .put(
    '/:id',
    authMiddleware,
    validateRequest({ params: checkUUID }),
    canEditOrDeleteComment,
    commentController.editCommentByCommentId,
  );

export default router;

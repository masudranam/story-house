import express from 'express';
import { commentController } from '../controller/commentController';
import { authMiddleware } from '../middleware/authMiddleware';
const router = express.Router();

 router
   .post('/', authMiddleware, commentController.postComment)
   .get('/', commentController.getComments)
   .delete('/', commentController.deleteComments)
   .get('/:id', commentController.deleteCommentById);
    

export default router;

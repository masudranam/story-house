import express from 'express';
import { commentController } from '../controller/commentController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
const router = express.Router();

 router
   .post('/',authMiddleware, commentController.postComment)
   .get('/', commentController.getComments)
   .delete('/',commentController.deleteComments)
   .get('/:id',authMiddleware, commentController.deleteCommentById);
    
export default router;

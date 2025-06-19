import express from 'express';

import { userController } from '../controller/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
const router = express.Router();

router.get('/', userController.getAllUsers);
router.delete('/', userController.deleteAllUsers);

router
  .route('/:id')
  .get(authMiddleware, userController.getUserById)
  .delete(authMiddleware, authorizeOwner, userController.deleteUserById)
  .put(authMiddleware, authorizeOwner, userController.updateUsernameById);

export default router;

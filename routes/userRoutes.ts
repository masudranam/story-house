import express from 'express';
import { userController } from '../controller/userController.ts';
import { authController } from '../controller/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/auth', authController.getAllAuth);
router.post('/signup', authController.signUpUser);
router.post('/login', authController.loginUser);
router.delete('/', userController.deleteAllUsers);

router
  .route('/:id')
  .get(userController.getUserById)
  .delete(authMiddleware, authorizeOwner, userController.deleteUserById)
  .put(authMiddleware, authorizeOwner, userController.updateUsernameById);

export default router;

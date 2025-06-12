import express from 'express';
import { userController } from '../controller/userController.ts';
import { authController } from '../controller/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { storyMiddleware } from '../middleware/storyMiddleware.ts';
const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/auth', authController.getAllAuth);
router.post('/signup', authController.signUpUser);
router.post('/login', authController.loginUser);

router.get('/byusername/:username', userController.getUserByUsername);
router
  .route('/:id')
  .get(userController.getUserById)
  .delete(authMiddleware, userController.deleteUserById)
  .put(authMiddleware, userController.updateUsernameById);

export default router;

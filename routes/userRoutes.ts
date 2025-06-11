import express from 'express';
import { userController } from '../controller/userController.ts';
import { authController } from '../controller/authController.ts';
import { middleWare } from '../middleware/authMiddleware.ts';
const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/auth', authController.getAllAuth);
router.post('/signup', authController.signUpUser);
router.post('/login', authController.loginUser);

router.get('/byusername/:username', userController.getUserByUsername);
router
  .route('/:id')
  .get(userController.getUserById)
  .delete(middleWare.authMiddleware, userController.deleteUserById)
  .put(middleWare.authMiddleware, userController.updateUsernameById);

export default router;

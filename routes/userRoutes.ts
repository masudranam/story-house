import express from 'express';
import { userController } from '../controller/userController.ts';
import { authController } from '../controller/authController.ts';
import { httpStatus } from '../utils/httpStatus.ts';
import {Auth} from '../database/models/auth.ts'
import { authMiddleware } from '../middleware/authMiddleware.ts';
const router = express.Router();
 

router.get('/', userController.getAllUsers);
router.get('/auth',authController.getAllAuth);
router.post('/signup',authController.signUpUser);
router.post('/login',authController.loginUser);
router.delete('/:username',authMiddleware,userController.deleteByUserName);
router.put('/:username',authMiddleware,userController.updateUserName);

router
  .route('/:id')
  .get(userController.getUserById)

export default router;

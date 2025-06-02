import express from 'express';
import { userController } from '../controller/userController.ts';
import { authController } from '../controller/authController.ts';

const router = express.Router();
 

router
  .get('/', userController.getAllUsers);
router
  .route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUserById)
  .delete(userController.deleteUserById);
 router.post('/signup',authController.signUpUser);
 router.post('/login',authController.loginUser);
 router.get('/auths',authController.getAllAuth)
export default router;

import express from 'express';

import { authController } from '../controller/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { signUpUserSchema } from '../dto/auth/signupUserDTO.ts';
import { loginUserSchema } from '../dto/auth/loginUserDTO.ts';
const router = express.Router();

router.post(
  '/signup',
  validateRequest({body: signUpUserSchema}),
  authController.signUpUser,
);
router.post(
  '/login',
  validateRequest({body: loginUserSchema}),
  authController.loginUser,
);
router.get('/auth', authController.getAllAuth);

export default router;

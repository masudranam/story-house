import express from 'express';

import { authController } from '../controller/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { signUpUserSchema } from '../dto/signupUserDTO.ts';
import { loginUserSchema } from '../dto/loginUserDTO.ts';
const router = express.Router();

router.post('/signup',validateRequest(signUpUserSchema), authController.signUpUser);
router.post('/login',validateRequest(loginUserSchema), authController.loginUser);
router.get('/auth', authController.getAllAuth);

export default router;

import express from 'express';

import { authController } from '../controller/authController.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { signUpUserSchema } from '../dto/auth/signupUserDTO.ts';
import { loginUserSchema, changePasswordSchema } from '../dto/auth/loginUserDTO.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
const router = express.Router();

router.post(
  '/signup',
  validateRequest({ body: signUpUserSchema }),
  authController.signUpUser,
);
router.post(
  '/login',
  validateRequest({ body: loginUserSchema }),
  authController.loginUser,
);

router.patch(
  '/change-password/:id',
  validateRequest({body: changePasswordSchema}),
  authMiddleware,
  authController.changePassword
);

router.get('/auth', authController.getAllAuth);

export default router;

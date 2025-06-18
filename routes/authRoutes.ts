import express from 'express';

import { authController } from '../controller/authController.ts';

const router = express.Router();

router.post('/signup', authController.signUpUser);
router.get('/auth', authController.getAllAuth);
router.post('/login', authController.loginUser);

export default router;

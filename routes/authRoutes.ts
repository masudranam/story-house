import express from 'express';
import { authController } from '../controller/authController.ts';

const router = express.Router();

router.get('/auth', authController.getAllAuth);
router.post('/signup', authController.signUpUser);
router.post('/login', authController.loginUser);

export default router;

import express from 'express';
import { userController } from '../controller/user.ts';

const router = express.Router();

router.post('/',userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUserById);
router.delete('/:id', userController.deleteUserById);

export default router;

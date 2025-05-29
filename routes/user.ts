import express from 'express';
import { userController } from '../controller/user.ts';

const router = express.Router();
const usercontroller = new userController();

router.post('/',usercontroller.createUser);
router.get('/', usercontroller.getAllUsers);
router.get('/:id', usercontroller.getUserById);
router.put('/:id', usercontroller.updateUserById);
router.delete('/:id', usercontroller.deleteUserById);

export default router;

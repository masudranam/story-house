import express from 'express';
import { userController } from '../controller/userController.ts';

const router = express.Router();
const usercontroller = new userController();

router
  .post('/', usercontroller.createUser)
  .get('/', usercontroller.getAllUsers);
router
  .route('/:id')
  .get(usercontroller.getUserById)
  .put(usercontroller.updateUserById)
  .delete(usercontroller.deleteUserById);

export default router;

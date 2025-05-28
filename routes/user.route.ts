import express from 'express';
import {
  createUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} from '../controller/user.controller.ts';

const router = express.Router();

router.post('/', createUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

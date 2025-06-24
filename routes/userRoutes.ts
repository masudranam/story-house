import express from 'express';

import { userController } from '../controller/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { userFiltersSchema } from '../dto/user/userFilters.ts';
const router = express.Router();

router.get('/',userController.searchUsers);
router.delete('/', userController.deleteAllUsers);

router
  .route('/:id')
  .get(authMiddleware,validateRequest({params: userFiltersSchema}), userController.getUserById)
  .delete(authMiddleware, authorizeOwner, validateRequest({params: userFiltersSchema}), userController.deleteUserById)
  .put(authMiddleware, authorizeOwner, validateRequest({params: userFiltersSchema}), userController.updateUsernameById);

export default router;

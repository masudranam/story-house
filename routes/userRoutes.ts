import express from 'express';

import { userController } from '../controller/userController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { authorizeOwner } from '../middleware/authorizeOwner.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { userFiltersSchema } from '../dto/user/userFilters.ts';
import { checkUUID } from '../dto/DTO.ts';
const router = express.Router();

router.get(
  '/',
  validateRequest({ query: userFiltersSchema }),
  userController.searchUsers,
);
router.delete('/', userController.deleteAllUsers);

router
  .route('/:id')
  .get(
    authMiddleware,
    validateRequest({ params: checkUUID }),
    userController.getUserById,
  )
  .delete(
    authMiddleware,
    authorizeOwner,
    validateRequest({ params: checkUUID }),
    userController.deleteUserById,
  )
  .put(
    authMiddleware,
    authorizeOwner,
    validateRequest({ query: userFiltersSchema, params: checkUUID }),
    userController.updateUsernameById,
  );

export default router;

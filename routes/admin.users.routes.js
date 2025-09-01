import express from 'express';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validate.js';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  expireUser,
  deleteUser
} from '../controllers/admin.users.controller.js';
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  userParamsSchema
} from '../validation/user.validation.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate); // Updated from requireAuth to authenticate
router.use(requireRole('admin'));

// Routes
router.get('/', listUsers);
router.get('/:id', validateParams(userParamsSchema), getUser);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id', validateParams(userParamsSchema), validate(updateUserSchema), updateUser);
router.patch('/:id/password', validateParams(userParamsSchema), validate(resetPasswordSchema), resetPassword);
router.post('/:id/expire', validateParams(userParamsSchema), expireUser);
router.delete('/:id', validateParams(userParamsSchema), deleteUser);

export default router;
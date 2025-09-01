import express from 'express';
import { register, login, refresh, logout, updatePaymentStatus, me, updateMe } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { registerSchema, loginSchema, refreshSchema, updateProfileSchema } from '../validation/auth.validation.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', logout);

// Payment status update
router.post('/payment-status/:userId', updatePaymentStatus);

// Protected routes
router.get('/me', authenticate, me);
router.put('/me', authenticate, validate(updateProfileSchema), updateMe);

export default router;
import express from 'express';
import { authenticate } from '../middlewares/auth.js'; // Changed requireAuth to authenticate
import { validate } from '../middlewares/validate.js';
import { me, updateMe } from '../controllers/auth.controller.js';
import { updateMeSchema } from '../validation/user.validation.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate); // Changed requireAuth to authenticate

router.get('/', me);
router.put('/', validate(updateMeSchema), updateMe);

export default router;
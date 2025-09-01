import express from 'express';
import authRoutes from './auth.routes.js';
import paypalRoutes from './paypal.routes.js';
import adminUsersRoutes from './admin.users.routes.js';
import adminEventsRoutes from './admin.events.routes.js';
import meRoutes from './me.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/paypal', paypalRoutes);
router.use('/me', meRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/admin/events', adminEventsRoutes);

export default router;

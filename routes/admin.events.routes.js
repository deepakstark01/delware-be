import express from 'express';
import multer from 'multer';
import { authenticate, requireRole } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validate.js';
import {
  listEvents,
  getEvent,
  getEventImage,
  createEvent,
  updateEvent,
  deleteEvent,
  bookEvent
} from '../controllers/admin.events.controller.js';
import {
  createEventSchema,
  updateEventSchema,
  eventParamsSchema
} from '../validation/event.validation.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Add debug middleware to see what routes are being hit
router.use((req, res, next) => {
  console.log(`Admin Events Route: ${req.method} ${req.path}`);
  next();
});

// CRITICAL: Image endpoint MUST be first and public
router.get('/:id/image', (req, res, next) => {
  console.log('Image route hit for ID:', req.params.id);
  next();
}, validateParams(eventParamsSchema), getEventImage);
router.get('/', listEvents);
// Apply authentication and role-based authorization to all other routes
router.use(authenticate);
router.post('/:id/book', authenticate, bookEvent);
// Route to get authenticated user's booking history
import { getMyBookings } from '../controllers/admin.events.controller.js';
router.get('/my-bookings', authenticate, getMyBookings);
router.use(requireRole('admin'));

// Protected admin routes

router.get('/:id', validateParams(eventParamsSchema), getEvent);
router.post('/', upload.single('image'), validate(createEventSchema), createEvent);
router.patch('/:id', validateParams(eventParamsSchema), upload.single('image'), validate(updateEventSchema), updateEvent);
router.delete('/:id', validateParams(eventParamsSchema), deleteEvent);


export default router;
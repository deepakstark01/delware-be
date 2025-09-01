import express from 'express';
import { createPayPalOrder, handleWebhook } from '../controllers/paypal.controller.js';
import { rawBodyParser } from '../middlewares/rawBody.js';
import { validate } from '../middlewares/validate.js';
import Joi from 'joi';

const router = express.Router();

const createOrderSchema = Joi.object({
  pendingRegistrationId: Joi.string().required()
});

router.post('/create-order', validate(createOrderSchema), createPayPalOrder);
router.post('/webhook', rawBodyParser, handleWebhook);

export default router;

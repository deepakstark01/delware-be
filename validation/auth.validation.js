import Joi from 'joi';

// Changed export name from registerIntentSchema to registerSchema
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(), // Added password field
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zip: Joi.string().max(20).optional(),
  // Changed field name from plan to membershipPlan and updated valid values
  membershipPlan: Joi.string().valid(
    'basic', 'premium', 'pro',
    'College Student', 'Sole Entrepreneur', 'Small Business',
    'Corporate', 'Nonprofit/Government', 'Premier/Founders Circle'
  ).required(),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').default('pending')
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

// Added the updateProfileSchema that's imported in the routes
export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zip: Joi.string().max(20).optional()
});

// Added schema for payment status updates
export const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed').required(),
  paymentId: Joi.string().allow('').optional()
});
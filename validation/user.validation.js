import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zip: Joi.string().max(20).optional(),
  role: Joi.string().valid('member', 'admin').optional(),
  membershipPlan: Joi.string().optional(),
  membershipStatus: Joi.string().valid('active', 'expired', 'pending', 'canceled').optional()
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zip: Joi.string().max(20).optional(),
  role: Joi.string().valid('member', 'admin').optional(),
  membershipPlan: Joi.string().optional(),
  membershipStatus: Joi.string().valid('active', 'expired', 'pending', 'canceled').optional(),
  membershipStartAt: Joi.date().optional(),
  membershipEndAt: Joi.date().optional()
}).min(1);

export const updateMeSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().min(10).max(20).optional(),
  address: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(50).optional(),
  zip: Joi.string().max(20).optional()
}).min(1);

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});

export const userParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

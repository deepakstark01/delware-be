import Joi from 'joi';

export const createEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
  startsAt: Joi.date().iso().required(),
  endsAt: Joi.date().iso().min(Joi.ref('startsAt')).required()
});

export const updateEventSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(2000).optional(),
  location: Joi.string().max(200).optional(),
  startsAt: Joi.date().iso().optional(),
  endsAt: Joi.date().iso().when('startsAt', {
    is: Joi.exist(),
    then: Joi.date().iso().min(Joi.ref('startsAt')).required(),
    otherwise: Joi.date().iso().optional()
  })
}).min(1);

export const eventParamsSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

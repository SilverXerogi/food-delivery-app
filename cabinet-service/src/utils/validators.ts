import Joi from 'joi';
import type { CreateOrderRequest, UpdateProfileRequest } from '@food-delivery-app/shared-types';

export const updateProfileSchema = Joi.object<UpdateProfileRequest>({
  firstName: Joi.string().min(2),
  lastName: Joi.string().min(2),
  phone: Joi.string().allow('', null),
}).min(1);

export const createOrderSchema = Joi.object<CreateOrderRequest>({
  deliveryAddress: Joi.string().min(5).required(),
  comment: Joi.string().allow('', null),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
});

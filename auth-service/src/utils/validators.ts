import Joi from 'joi';
import type { LoginRequest, RegisterRequest, RefreshTokenRequest } from '../../../shared-types/src';

export const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  phone: Joi.string().optional().allow(null, ''),
});

export const refreshTokenSchema = Joi.object<RefreshTokenRequest>({
  refreshToken: Joi.string().required(),
});

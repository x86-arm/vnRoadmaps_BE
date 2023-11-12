import Joi from 'joi';
import { Request } from 'express';

export const usersValidate = (body: Request) => {
  const schema = Joi.object({
    fullname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(128).required(),
    avatar: Joi.string(),
    bio: Joi.string(),
    is_enabled: Joi.boolean(),
    is_deleted: Joi.boolean(),
    tick: Joi.boolean(),
    followings_count: Joi.number(),
    followers_count: Joi.number(),
    likes_count: Joi.number(),
    website_url: Joi.string(),
    social_network: Joi.array(),
    role: Joi.string(),
  });

  return schema.validate(body);
};

export const loginValidate = (body: Request) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(128).required(),
  });

  return schema.validate(body);
};

export const forgotPasswordValidate = (body: Request) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  return schema.validate(body);
};

export const recoverPasswordValidate = (body: Request) => {
  const schema = Joi.object({
    reqID: Joi.string().min(5).max(128).required(),
    newPassword: Joi.string().min(5).max(128).required(),
  });

  return schema.validate(body);
};

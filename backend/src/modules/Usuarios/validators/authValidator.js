// validators/authValidator.js
import { body, param, validationResult } from 'express-validator';
import ApiError from '../../../utils/ApiError.js';

const validate = (req,_res,next)=>{
  const errs = validationResult(req);
  if(!errs.isEmpty()) return next(new ApiError('Invalid data',422,errs.array()));
  next();
};

export const vLogin = [
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
];

export const vRegister = [
  body('nombre').notEmpty(),
  body('apellido').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({min:6}),
  validate,
];

export const vForgot = [ body('email').isEmail(), validate ];
export const vReset  = [
  param('token').notEmpty(),
  body('password').isLength({min:6}),
  validate,
];

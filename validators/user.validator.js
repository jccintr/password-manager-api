import { body } from 'express-validator';

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido'),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória')
    .isLength({ min: 3 }).withMessage('Senha deve ter pelo menos 3 caracteres'),

  body('kdfSalt')
    .exists({ checkFalsy: true })
    .withMessage('kdfSalt é obrigatório')
    .bail()
    .isString()
    .withMessage('kdfSalt inválido'),
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email é obrigatório')
    .isEmail().withMessage('Email inválido'),

  body('password')
    .notEmpty().withMessage('Senha é obrigatória'),
];

export const updateProfileValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome é obrigatório')
    .isLength({ min: 3 }).withMessage('Nome deve ter pelo menos 3 caracteres'),
];

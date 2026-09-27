import { body } from 'express-validator';

export const createVaultItemValidator = [
  body('ciphertext')
    .exists({ checkFalsy: true })
    .withMessage('ciphertext é obrigatório')
    .bail()
    .isString()
    .withMessage('ciphertext inválido'),

  body('nonce')
    .exists({ checkFalsy: true })
    .withMessage('nonce é obrigatório')
    .bail()
    .isString()
    .withMessage('nonce inválido'),

  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('version deve ser um inteiro >= 1'),
];

export const updateVaultItemValidator = [
  body('ciphertext')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('ciphertext inválido'),

  body('nonce')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('nonce inválido'),

  body('version')
    .optional()
    .isInt({ min: 1 })
    .withMessage('version deve ser um inteiro >= 1'),
];

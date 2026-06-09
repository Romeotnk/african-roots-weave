import { body } from 'express-validator';

export const initiatePaymentValidator = [
  body('orderId').isString().notEmpty(),
  body('method').isIn(['card', 'mobile_money', 'wallet']),
];

export const depositValidator = [body('amount').isFloat({ min: 1 })];

export const withdrawValidator = [body('amount').isFloat({ min: 1 })];

export const transferValidator = [
  body('receiverId').isString().notEmpty(),
  body('amount').isFloat({ min: 1 }),
];

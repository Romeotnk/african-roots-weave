import { body, oneOf } from "express-validator";

export const initiatePaymentValidator = [
  body("orderId").isString().notEmpty(),
  body("method").isIn(["card", "mobile_money", "wallet"]),
];

export const depositValidator = [body("amount").isFloat({ min: 1 })];

export const withdrawValidator = [body("amount").isFloat({ min: 1 })];

export const transferValidator = [
  oneOf([body("receiverId").isString().notEmpty(), body("receiverEmail").isEmail().normalizeEmail()]),
  body("receiverId").optional().isString().notEmpty(),
  body("receiverEmail").optional().isEmail().normalizeEmail(),
  body("amount").isFloat({ min: 1 }),
];

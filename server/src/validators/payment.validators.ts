import { body, oneOf } from "express-validator";

export const initiatePaymentValidator = [
  body("orderId").isString().notEmpty(),
  body("method").isIn(["card", "mobile_money", "wallet"]),
];

export const depositValidator = [body("amount").isFloat({ min: 1 })];

export const withdrawValidator = [
  body("amount").isFloat({ min: 1 }),
  body("destination").optional().isString(),
  // validateRequest replaces req.body with matchedData() afterwards — any
  // field not declared here (even an optional, unvalidated one) is silently
  // dropped before the controller ever sees it. pin has to be listed even
  // though there's nothing to validate about its format beyond "a string".
  body("pin").optional().isString(),
];

export const transferValidator = [
  oneOf([body("receiverId").isString().notEmpty(), body("receiverEmail").isEmail().normalizeEmail()]),
  body("receiverId").optional().isString().notEmpty(),
  body("receiverEmail").optional().isEmail().normalizeEmail(),
  body("amount").isFloat({ min: 1 }),
  body("pin").optional().isString(),
];

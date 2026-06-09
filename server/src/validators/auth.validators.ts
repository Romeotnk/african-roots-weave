import { body, param } from "express-validator";

const passwordRules = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters")
  .matches(/[A-Z]/)
  .withMessage("Password must include an uppercase letter")
  .matches(/[a-z]/)
  .withMessage("Password must include a lowercase letter")
  .matches(/[0-9]/)
  .withMessage("Password must include a number")
  .matches(/[^A-Za-z0-9]/)
  .withMessage("Password must include a special character");

export const registerValidator = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  passwordRules,
  body("firstName").isString().isLength({ min: 2, max: 80 }).escape(),
  body("lastName").isString().isLength({ min: 2, max: 80 }).escape(),
  body("country").isString().isLength({ min: 2, max: 80 }).escape(),
  body("language").optional().isIn(["fr", "en", "ar"]),
  body("referralCode").optional().isString().trim().escape(),
  body("turnstileToken").optional().isString(),
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isString().notEmpty().withMessage("Password required"),
];

export const emailValidator = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
];

export const resetPasswordValidator = [param("token").isString().notEmpty(), passwordRules];

export const tokenParamValidator = [param("token").isString().notEmpty()];

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
  body("role").optional().isIn(["USER", "PROFESSIONAL"]),
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

export const updateMeValidator = [
  body("firstName").optional().isString().isLength({ min: 2, max: 80 }).trim().escape(),
  body("lastName").optional().isString().isLength({ min: 2, max: 80 }).trim().escape(),
  body("country").optional().isString().isLength({ min: 2, max: 80 }).trim().escape(),
  body("language").optional().isIn(["fr", "en", "ar"]),
  body("avatarUrl").optional({ nullable: true }).isURL({ require_protocol: true }).isLength({ max: 2048 }),
];

export const submitKycValidator = [
  body("docType").isIn(["CNI", "Passeport", "Permis de conduire", "Titre de sejour"]),
  body("country").isString().isLength({ min: 2, max: 80 }).trim().escape(),
  body("documentNumber").isString().isLength({ min: 2, max: 80 }).trim().escape(),
  body("expiresAt").optional({ nullable: true, checkFalsy: true }).isISO8601(),
  body("files").optional().isObject(),
  body("files.front").optional().isString().isLength({ max: 255 }).trim().escape(),
  body("files.back").optional().isString().isLength({ max: 255 }).trim().escape(),
  body("files.selfie").optional().isString().isLength({ max: 255 }).trim().escape(),
];

export const changePasswordValidator = [
  body("currentPassword").isString().notEmpty().withMessage("Current password required"),
  passwordRules,
];

export const tokenParamValidator = [param("token").isString().notEmpty()];

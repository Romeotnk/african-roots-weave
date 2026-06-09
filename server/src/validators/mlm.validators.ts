import { body, param } from "express-validator";

export const trackClickValidator = [body("code").isString().notEmpty().trim().escape()];

export const captureCodeValidator = [param("code").isString().notEmpty().trim().escape()];

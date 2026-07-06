import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authRateLimit } from "../middlewares/rateLimit.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  emailValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  tokenParamValidator,
} from "../validators/auth.validators.js";

export const authRouter = Router();

// Public authentication lifecycle.
authRouter.post("/register", authRateLimit, registerValidator, validateRequest, register);
authRouter.post("/login", authRateLimit, loginValidator, validateRequest, login);
authRouter.post("/refresh", refresh);
authRouter.get("/me", authMiddleware, me);
authRouter.post("/logout", logout);

// Email and password recovery.
authRouter.post("/verify-email/:token", tokenParamValidator, validateRequest, verifyEmail);
authRouter.post("/forgot-password", authRateLimit, emailValidator, validateRequest, forgotPassword);
authRouter.post(
  "/reset-password/:token",
  authRateLimit,
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);

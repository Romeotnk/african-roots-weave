import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerificationEmail,
  resetPassword,
  supabaseAuth,
  submitKyc,
  updateMe,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  loginRateLimit,
  passwordResetRateLimit,
  registerRateLimit,
  sensitiveActionRateLimit,
} from "../middlewares/rateLimit.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  changePasswordValidator,
  emailValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  submitKycValidator,
  supabaseAuthValidator,
  tokenParamValidator,
  updateMeValidator,
} from "../validators/auth.validators.js";

export const authRouter = Router();

// Public authentication lifecycle.
authRouter.post("/register", registerRateLimit, registerValidator, validateRequest, register);
authRouter.post("/login", loginRateLimit, loginValidator, validateRequest, login);
authRouter.post("/refresh", refresh);
authRouter.post("/supabase", supabaseAuthValidator, validateRequest, supabaseAuth);
authRouter.get("/me", authMiddleware, me);
authRouter.patch("/me", authMiddleware, updateMeValidator, validateRequest, updateMe);
authRouter.post(
  "/kyc",
  authMiddleware,
  sensitiveActionRateLimit,
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  submitKycValidator,
  validateRequest,
  submitKyc,
);
authRouter.post("/change-password", authMiddleware, changePasswordValidator, validateRequest, changePassword);
authRouter.post("/logout", logout);

// Email and password recovery.
authRouter.post("/verify-email/:token", tokenParamValidator, validateRequest, verifyEmail);
authRouter.post(
  "/resend-verification",
  passwordResetRateLimit,
  emailValidator,
  validateRequest,
  resendVerificationEmail,
);
authRouter.post("/forgot-password", passwordResetRateLimit, emailValidator, validateRequest, forgotPassword);
authRouter.post(
  "/reset-password/:token",
  passwordResetRateLimit,
  resetPasswordValidator,
  validateRequest,
  resetPassword,
);

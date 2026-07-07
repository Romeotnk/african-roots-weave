import type { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { ApiError } from "../utils/errors.js";

const unauthorized = () => new ApiError(403, "Accès non autorisé");

export const checkRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(unauthorized());
      return;
    }

    next();
  };

export const roleMiddleware = (roles: Role[]) => checkRole(...roles);

export const checkAdminAccess: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  if (!["SUPER_ADMIN", "ADMIN", "MODERATOR", "EDITOR"].includes(req.user.role)) {
    next(unauthorized());
    return;
  }

  next();
};

export const requireEmailVerified: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new ApiError(401, "Authentication required"));
    return;
  }

  if (!req.user.isEmailVerified) {
    next(new ApiError(403, "Email verification required"));
    return;
  }

  next();
};

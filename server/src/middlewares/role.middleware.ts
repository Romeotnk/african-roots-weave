import { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { ApiError } from "../utils/errors.js";
import { hasPermission } from "../services/permissions.service.js";

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

  if (!["SUPER_ADMIN", "ADMIN"].includes(req.user.role)) {
    next(unauthorized());
    return;
  }

  next();
};

// Granular alternative to checkRole/roleMiddleware: allows any role that
// currently holds at least one of the given permissions, per the effective
// set computed by permissions.service.ts (role defaults + that user's
// individual overrides). SUPER_ADMIN always bypasses, same as checkRole's
// implicit behavior via roleRank in admin.controller.ts.
export const checkPermission =
  (...permissions: string[]): RequestHandler =>
  async (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (req.user.role === Role.SUPER_ADMIN) {
      next();
      return;
    }

    const granted = await Promise.all(permissions.map((permission) => hasPermission(req.user!.id, req.user!.role, permission)));
    if (!granted.some(Boolean)) {
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

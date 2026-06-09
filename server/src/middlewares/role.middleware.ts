import type { Role } from "@prisma/client";
import type { RequestHandler } from "express";
import { ApiError } from "../utils/errors.js";

export const roleMiddleware =
  (roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      next(new ApiError(401, "Authentication required"));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(403, "Insufficient permissions"));
      return;
    }

    next();
  };

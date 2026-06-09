import type { RequestHandler } from 'express';
import { ApiError } from '../utils/errors.js';

export const kycMiddleware: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  if (req.user.kycStatus !== 'VERIFIED') {
    next(new ApiError(403, 'KYC verification required'));
    return;
  }

  next();
};

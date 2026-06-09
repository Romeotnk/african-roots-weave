import type { RequestHandler } from "express";
import { prisma } from "../config/db.js";
import { redisGet } from "../config/redis.js";
import { ApiError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authMiddleware: RequestHandler = async (req, _res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const blacklistKey = `jwt:blacklist:${token}`;
    if (await redisGet(blacklistKey)) {
      throw new ApiError(401, "Token revoked");
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        language: true,
        kycStatus: true,
        isActive: true,
        isBanned: true,
      },
    });

    if (!user || !user.isActive || user.isBanned) {
      throw new ApiError(401, "Account unavailable");
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      language: user.language,
      kycStatus: user.kycStatus,
    };
    req.language = user.language;
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token"));
  }
};

import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { env } from "../config/env.js";

export type AccessTokenPayload = JwtPayload & {
  sub: string;
  role: Role;
  email: string;
  language: string;
  kycStatus: string;
};

type SignAccessPayload = {
  userId: string;
  role: Role;
  email: string;
  language: string;
  kycStatus: string;
};

export const signAccessToken = (payload: SignAccessPayload) =>
  jwt.sign(
    {
      role: payload.role,
      email: payload.email,
      language: payload.language,
      kycStatus: payload.kycStatus,
    },
    env.jwtAccessSecret,
    {
      subject: payload.userId,
      expiresIn: "15m",
    },
  );

export const signRefreshToken = (userId: string, tokenId: string) =>
  jwt.sign({ tokenId }, env.jwtRefreshSecret, {
    subject: userId,
    expiresIn: "7d",
  });

export const signEmailToken = (userId: string) =>
  jwt.sign({}, env.jwtEmailSecret, {
    subject: userId,
    expiresIn: "24h",
  });

export const signPasswordResetToken = (userId: string) =>
  jwt.sign({}, env.jwtPasswordResetSecret, {
    subject: userId,
    expiresIn: "1h",
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.jwtRefreshSecret) as JwtPayload & { sub: string; tokenId: string };

export const verifyEmailToken = (token: string) =>
  jwt.verify(token, env.jwtEmailSecret) as JwtPayload & { sub: string };

export const verifyPasswordResetToken = (token: string) =>
  jwt.verify(token, env.jwtPasswordResetSecret) as JwtPayload & { sub: string };

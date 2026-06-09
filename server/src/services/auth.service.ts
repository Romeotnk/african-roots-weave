import bcrypt from "bcryptjs";
import type { KycStatus, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { hashToken, randomToken } from "../utils/random.js";
import { signAccessToken, signEmailToken, signRefreshToken } from "../utils/tokens.js";

const refreshTokenExpiresAt = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

export const createAccessTokenForUser = (user: {
  id: string;
  role: Role;
  email: string;
  language: string;
  kycStatus: KycStatus;
}) =>
  signAccessToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    language: user.language,
    kycStatus: user.kycStatus,
  });

export const createRefreshTokenForUser = async (userId: string) => {
  const rawToken = randomToken(48);
  const tokenHash = hashToken(rawToken);
  const refreshToken = await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt: refreshTokenExpiresAt(),
    },
    select: { id: true },
  });

  return signRefreshToken(userId, `${refreshToken.id}.${rawToken}`);
};

export const rotateRefreshToken = async (userId: string, tokenId: string, rawToken: string) => {
  const token = await prisma.refreshToken.findUnique({
    where: { id: tokenId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          language: true,
          kycStatus: true,
          isActive: true,
          isBanned: true,
        },
      },
    },
  });

  if (
    !token ||
    token.userId !== userId ||
    token.revokedAt ||
    token.expiresAt < new Date() ||
    token.tokenHash !== hashToken(rawToken) ||
    !token.user.isActive ||
    token.user.isBanned
  ) {
    return null;
  }

  await prisma.refreshToken.update({
    where: { id: token.id },
    data: { revokedAt: new Date() },
  });

  return {
    user: token.user,
    accessToken: createAccessTokenForUser(token.user),
    refreshToken: await createRefreshTokenForUser(token.user.id),
  };
};

export const createEmailVerification = async (userId: string) => {
  const token = signEmailToken(userId);
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return `${env.clientUrl}/verify-email/${token}`;
};

export const createPasswordReset = async (userId: string, token: string) => {
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return `${env.clientUrl}/reset-password/${token}`;
};

export const hashPassword = (password: string) => bcrypt.hash(password, 12);

export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

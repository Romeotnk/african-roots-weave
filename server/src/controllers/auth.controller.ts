import { Prisma } from '@prisma/client';
import { prisma } from '../config/db.js';
import { redis } from '../config/redis.js';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email.service.js';
import { verifyTurnstile } from '../services/turnstile.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { clearRefreshCookie, setRefreshCookie } from '../utils/cookies.js';
import { ApiError } from '../utils/errors.js';
import { generateReferralCode, hashToken } from '../utils/random.js';
import {
  createAccessTokenForUser,
  createEmailVerification,
  createPasswordReset,
  createRefreshTokenForUser,
  hashPassword,
  rotateRefreshToken,
  verifyPassword,
} from '../services/auth.service.js';
import { signPasswordResetToken, verifyEmailToken, verifyPasswordResetToken, verifyRefreshToken } from '../utils/tokens.js';

/**
 * POST /api/auth/register
 *
 * Creates a user account, hashes the password, attaches referral metadata,
 * creates the initial MLM node, and sends an email verification link.
 *
 * Request example:
 * { "email": "ama@example.com", "password": "Admin@123", "firstName": "Ama", "lastName": "Kone", "country": "CI" }
 *
 * Possible errors:
 * - 400 invalid Turnstile token
 * - 409 email already used
 * - 422 validation error
 */
export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, country, language = 'fr', referralCode, turnstileToken } = req.body;

  const turnstileOk = await verifyTurnstile(turnstileToken, req.ip);
  if (!turnstileOk) {
    throw new ApiError(400, 'Turnstile verification failed');
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const sponsor = referralCode
    ? await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true, mlmNode: { select: { id: true, level: true } } },
      })
    : null;

  let generatedReferralCode = generateReferralCode(firstName, lastName);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await prisma.user.findUnique({ where: { referralCode: generatedReferralCode }, select: { id: true } });
    if (!exists) break;
    generatedReferralCode = generateReferralCode(firstName, lastName);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        country,
        language,
        referralCode: generatedReferralCode,
        referredById: sponsor?.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        language: true,
        kycStatus: true,
        referralCode: true,
      },
    });

    await tx.mLMNode.create({
      data: {
        userId: created.id,
        parentId: sponsor?.mlmNode?.id,
        level: sponsor?.mlmNode ? sponsor.mlmNode.level + 1 : 0,
        affiliateCode: generatedReferralCode,
      },
    });

    return created;
  });

  const verificationUrl = await createEmailVerification(user.id);
  await sendVerificationEmail(user.email, verificationUrl);

  res.status(201).json(apiResponse(true, { user }, 'Account created. Please verify your email.'));
});

/**
 * POST /api/auth/login
 *
 * Authenticates a user and returns a 15-minute access token plus a 7-day
 * refresh token stored in an httpOnly cookie.
 *
 * Possible errors:
 * - 401 invalid credentials
 * - 403 banned or inactive account
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      role: true,
      firstName: true,
      lastName: true,
      language: true,
      kycStatus: true,
      isActive: true,
      isBanned: true,
      banReason: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid credentials');
  }

  if (!user.isActive || user.isBanned) {
    throw new ApiError(403, user.banReason ?? 'Account unavailable');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = createAccessTokenForUser(user);
  const refreshToken = await createRefreshTokenForUser(user.id);
  setRefreshCookie(res, refreshToken);

  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json(apiResponse(true, { accessToken, user: safeUser }, 'Login successful'));
});

/**
 * POST /api/auth/refresh
 *
 * Rotates the refresh token cookie and returns a new access token.
 *
 * Possible errors:
 * - 401 missing, invalid, expired or reused refresh token
 */
export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const [tokenId, rawToken] = String(payload.tokenId).split('.');
  const rotation = await rotateRefreshToken(payload.sub, tokenId, rawToken);

  if (!rotation) {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Invalid refresh token');
  }

  setRefreshCookie(res, rotation.refreshToken);
  res.json(apiResponse(true, { accessToken: rotation.accessToken, user: rotation.user }, 'Token refreshed'));
});

/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token and blacklists the current access token in Redis
 * when Redis is configured.
 */
export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const [tokenId] = String(payload.tokenId).split('.');
      await prisma.refreshToken.updateMany({
        where: { id: tokenId, userId: payload.sub },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Invalid refresh token is still logged out client-side.
    }
  }

  const accessToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (accessToken && redis) {
    await redis.set(`jwt:blacklist:${accessToken}`, '1', 'EX', 15 * 60);
  }

  clearRefreshCookie(res);
  res.json(apiResponse(true, null, 'Logged out'));
});

/**
 * POST /api/auth/verify-email/:token
 *
 * Verifies a user's email address from the 24-hour email token.
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const payload = verifyEmailToken(token);
  const stored = await prisma.emailVerificationToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: payload.sub }, data: { isEmailVerified: true } }),
  ]);

  res.json(apiResponse(true, null, 'Email verified'));
});

/**
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email when the account exists.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });

  if (user) {
    const token = signPasswordResetToken(user.id);
    const resetUrl = await createPasswordReset(user.id, token);
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  res.json(apiResponse(true, null, 'If the email exists, a reset link has been sent'));
});

/**
 * POST /api/auth/reset-password/:token
 *
 * Replaces the user's password and revokes all refresh tokens.
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const payload = verifyPasswordResetToken(token);
  const stored = await prisma.passwordResetToken.findFirst({
    where: {
      userId: payload.sub,
      tokenHash: hashToken(token),
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: payload.sub, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);

  res.json(apiResponse(true, null, 'Password reset successful'));
});

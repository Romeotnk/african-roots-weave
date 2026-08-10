import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { env } from "../config/env.js";
import { redisSet } from "../config/redis.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../services/email.service.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { verifyTurnstile } from "../services/turnstile.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  clearCsrfCookie,
  clearRefreshCookie,
  setCsrfCookie,
  setRefreshCookie,
} from "../utils/cookies.js";
import { ApiError } from "../utils/errors.js";
import { generateReferralCode, hashToken, randomToken } from "../utils/random.js";
import {
  createAccessTokenForUser,
  createEmailVerification,
  createPasswordReset,
  createRefreshTokenForUser,
  hashPassword,
  rotateRefreshToken,
  verifyPassword,
} from "../services/auth.service.js";
import {
  signPasswordResetToken,
  verifyEmailToken,
  verifyPasswordResetToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

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
  const {
    email,
    password,
    firstName,
    lastName,
    country,
    role = "USER",
    language = "fr",
    referralCode,
    turnstileToken,
  } = req.body;

  const turnstileOk = await verifyTurnstile(turnstileToken, req.ip);

  if (!turnstileOk) {
    throw new ApiError(400, "Turnstile verification failed");
  }

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw new ApiError(409, "Email already registered");
  }

  const sponsor = referralCode
    ? await prisma.user.findUnique({
        where: { referralCode },
        select: { id: true, mlmNode: { select: { id: true, level: true } } },
      })
    : null;

  let generatedReferralCode = generateReferralCode(firstName, lastName);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await prisma.user.findUnique({
      where: { referralCode: generatedReferralCode },
      select: { id: true },
    });
    if (!exists) break;
    generatedReferralCode = generateReferralCode(firstName, lastName);
  }

  const passwordHash = await hashPassword(password);
  const requestedRole = role === Role.PROFESSIONAL ? Role.PROFESSIONAL : Role.USER;

  // Prisma's default interactive-transaction timeout (5s) is too tight for
  // this pooled Supabase connection, which regularly takes 6-13s round-trip
  // under load — without extra headroom this transaction gets killed
  // (P2028) before user.create/mLMNode.create can finish.
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        country,
        role: requestedRole,
        adminSubRole: null,
        isResearcher: false,
        language,
        referralCode: generatedReferralCode,
        referredById: sponsor?.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        adminSubRole: true,
        isResearcher: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        country: true,
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
  }, { timeout: 20000, maxWait: 10000 });

  const verificationUrl = await createEmailVerification(user.id);
  let emailSent = false;
  const shouldSkipEmailInDev = env.nodeEnv !== "production";

  try {
    await sendVerificationEmail(user.email, verificationUrl);
    emailSent = true;
  } catch (emailError) {
    console.warn("Email verification skipped:", emailError);
  }

  if (!emailSent && shouldSkipEmailInDev) {
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
  }

  const message = emailSent
    ? "Account created. Please verify your email."
    : shouldSkipEmailInDev
      ? "Account created. Email verification is disabled in local development, so your account is activated immediately."
      : "Account created. Please verify your email.";

  res.status(201).json(apiResponse(true, { user, emailSent, isEmailVerified: emailSent || shouldSkipEmailInDev }, message));
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
      avatarUrl: true,
      country: true,
      language: true,
      kycStatus: true,
      adminSubRole: true,
      isResearcher: true,
      isEmailVerified: true,
      isActive: true,
      isBanned: true,
      banReason: true,
      banExpiresAt: true,
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (user.isBanned && user.banExpiresAt && user.banExpiresAt <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isBanned: false, banReason: null, banExpiresAt: null },
    });
    user.isBanned = false;
    user.banReason = null;
  }

  if (!user.isActive || user.isBanned) {
    throw new ApiError(403, user.banReason ?? "Account unavailable");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(
      403,
      "Veuillez vérifier votre adresse email avant de vous connecter. Utilisez le lien 'Renvoyer l'email de vérification' si nécessaire.",
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const accessToken = createAccessTokenForUser(user);
  const refreshToken = await createRefreshTokenForUser(user.id);
  setRefreshCookie(res, refreshToken);
  const csrfToken = setCsrfCookie(res);

  const { passwordHash: _passwordHash, ...safeUser } = user;
  res.json(apiResponse(true, { accessToken, user: safeUser, csrfToken }, "Login successful"));
});


type SupabaseUserResponse = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    picture?: string;
  };
};

const createUniqueReferralCode = async (firstName: string, lastName: string) => {
  let referralCode = generateReferralCode(firstName, lastName);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const exists = await prisma.user.findUnique({ where: { referralCode }, select: { id: true } });
    if (!exists) return referralCode;
    referralCode = generateReferralCode(firstName, lastName);
  }
  return `${generateReferralCode(firstName, lastName)}${randomToken(2).toUpperCase()}`;
};

const splitDisplayName = (metadata: SupabaseUserResponse["user_metadata"] = {}) => {
  const fullName = metadata.full_name ?? metadata.name ?? "";
  const [first, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: metadata.first_name ?? first ?? "Utilisateur",
    lastName: metadata.last_name ?? (rest.join(" ") || "Iwosan"),
  };
};

const getSupabaseUser = async (accessToken: string) => {
  if (!env.supabaseUrl || !env.supabasePublishableKey) {
    throw new ApiError(500, "Supabase OAuth is not configured");
  }

  const response = await fetch(`${env.supabaseUrl.replace(/\/+$/, "")}/auth/v1/user`, {
    headers: {
      apikey: env.supabasePublishableKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.warn(`[supabaseAuth] Supabase rejected the access token: ${response.status} ${body}`);
    throw new ApiError(401, "Invalid Supabase session");
  }

  return (await response.json()) as SupabaseUserResponse;
};

export const supabaseAuth = asyncHandler(async (req, res) => {
  const { accessToken: supabaseAccessToken } = req.body;
  const supabaseUser = await getSupabaseUser(supabaseAccessToken);

  if (!supabaseUser.email) {
    throw new ApiError(400, "Supabase account has no email");
  }

  const email = supabaseUser.email.toLowerCase();
  const metadata = supabaseUser.user_metadata ?? {};
  const { firstName, lastName } = splitDisplayName(metadata);
  const avatarUrl = metadata.avatar_url ?? metadata.picture ?? null;

  const user = await prisma.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        adminSubRole: true,
        isResearcher: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        country: true,
        language: true,
        kycStatus: true,
        isActive: true,
        isBanned: true,
        banReason: true,
        banExpiresAt: true,
      },
    });

    if (existing) {
      return tx.user.update({
        where: { id: existing.id },
        data: {
          isEmailVerified: true,
          lastLoginAt: new Date(),
          avatarUrl: existing.avatarUrl ?? avatarUrl,
        },
        select: {
          id: true,
          email: true,
          role: true,
          adminSubRole: true,
          isResearcher: true,
          isEmailVerified: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          country: true,
          language: true,
          kycStatus: true,
          isActive: true,
          isBanned: true,
          banReason: true,
          banExpiresAt: true,
        },
      });
    }

    const referralCode = await createUniqueReferralCode(firstName, lastName);
    const created = await tx.user.create({
      data: {
        email,
        passwordHash: await hashPassword(randomToken(48)),
        firstName,
        lastName,
        avatarUrl,
        country: "BJ",
        role: Role.USER,
        adminSubRole: null,
        isResearcher: false,
        isEmailVerified: true,
        language: "fr",
        referralCode,
        lastLoginAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        role: true,
        adminSubRole: true,
        isResearcher: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        country: true,
        language: true,
        kycStatus: true,
        isActive: true,
        isBanned: true,
        banReason: true,
        banExpiresAt: true,
      },
    });

    await tx.mLMNode.create({
      data: {
        userId: created.id,
        level: 0,
        affiliateCode: referralCode,
      },
    });

    return created;
  }, { timeout: 20000, maxWait: 10000 });

  if (user.isBanned && user.banExpiresAt && user.banExpiresAt <= new Date()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isBanned: false, banReason: null, banExpiresAt: null },
    });
    user.isBanned = false;
    user.banReason = null;
  }

  if (!user.isActive || user.isBanned) {
    throw new ApiError(403, user.banReason ?? "Account unavailable");
  }

  const accessToken = createAccessTokenForUser(user);
  const refreshToken = await createRefreshTokenForUser(user.id);
  setRefreshCookie(res, refreshToken);
  const csrfToken = setCsrfCookie(res);

  const { isActive: _isActive, isBanned: _isBanned, banReason: _banReason, banExpiresAt: _banExpiresAt, ...safeUser } = user;
  res.json(apiResponse(true, { accessToken, user: safeUser, csrfToken }, "Login successful"));
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
    throw new ApiError(401, "Refresh token required");
  }

  // Double-submit CSRF check: the refresh cookie alone can be replayed by a
  // cross-site request (it's sameSite:"none" in production for cross-origin
  // use), so also require a header that echoes a second, non-httpOnly
  // cookie a cross-site attacker can trigger sending but never read.
  const csrfCookie = req.cookies[CSRF_COOKIE_NAME];
  const csrfHeader = req.headers[CSRF_HEADER_NAME];
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw new ApiError(403, "Invalid CSRF token");
  }

  const payload = verifyRefreshToken(refreshToken);
  const [tokenId, rawToken] = String(payload.tokenId).split(".");
  const rotation = await rotateRefreshToken(payload.sub, tokenId, rawToken);

  if (!rotation) {
    clearRefreshCookie(res);
    clearCsrfCookie(res);
    throw new ApiError(401, "Invalid refresh token");
  }

  setRefreshCookie(res, rotation.refreshToken);
  const csrfToken = setCsrfCookie(res);
  res.json(
    apiResponse(
      true,
      { accessToken: rotation.accessToken, user: rotation.user, csrfToken },
      "Token refreshed",
    ),
  );
});

/**
 * POST /api/auth/logout
 *
 * Revokes the refresh token and blacklists the current access token in Redis
 * when Redis is configured.
 */
export const me = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      country: true,
      language: true,
      kycStatus: true,
      adminSubRole: true,
      isResearcher: true,
      isEmailVerified: true,
      isActive: true,
      isBanned: true,
      banReason: true,
      banExpiresAt: true,
      lastLoginAt: true,
      createdAt: true,
      walletPinHash: true,
    },
  });

  if (!user || !user.isActive || user.isBanned) {
    throw new ApiError(401, "Account unavailable");
  }

  // Never send the hash itself to the client — only whether one is set, so
  // the wallet UI knows whether to prompt for a PIN on withdraw/transfer.
  const { walletPinHash, ...publicUser } = user;
  res.json(apiResponse(true, { ...publicUser, hasWalletPin: Boolean(walletPinHash) }, "Profile loaded"));
});

export const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const { firstName, lastName, country, language, avatarUrl } = req.body;
  const data: Prisma.UserUpdateInput = {};

  if (firstName !== undefined) data.firstName = firstName;
  if (lastName !== undefined) data.lastName = lastName;
  if (country !== undefined) data.country = country;
  if (language !== undefined) data.language = language;
  if (avatarUrl !== undefined) data.avatarUrl = avatarUrl || null;

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      adminSubRole: true,
      isResearcher: true,
      isEmailVerified: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      country: true,
      language: true,
      kycStatus: true,
      isActive: true,
      isBanned: true,
      banReason: true,
      banExpiresAt: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  res.json(apiResponse(true, user, "Profile updated"));
});

const ALLOWED_KYC_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);

export const submitKyc = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const { docType, country, documentNumber, expiresAt } = req.body;
  const uploadedFiles = (req.files ?? {}) as Record<string, Express.Multer.File[] | undefined>;
  const front = uploadedFiles.front?.[0];
  const back = uploadedFiles.back?.[0];
  const selfie = uploadedFiles.selfie?.[0];

  if (!front || !selfie) {
    throw new ApiError(400, "Le recto du document et le selfie sont requis");
  }
  if (docType === "CNI" && !back) {
    throw new ApiError(400, "Le verso est requis pour une CNI");
  }
  for (const file of [front, back, selfie].filter((value): value is Express.Multer.File => Boolean(value))) {
    if (!ALLOWED_KYC_MIME_TYPES.has(file.mimetype)) {
      throw new ApiError(400, "Format de fichier non supporte (image ou PDF uniquement)");
    }
  }

  const [frontUrl, backUrl, selfieUrl] = await Promise.all([
    uploadBufferToCloudinary(front.buffer, "iwosan/kyc", "auto"),
    back ? uploadBufferToCloudinary(back.buffer, "iwosan/kyc", "auto") : Promise.resolve(undefined),
    uploadBufferToCloudinary(selfie.buffer, "iwosan/kyc", "auto"),
  ]);

  const kycDocuments: Prisma.InputJsonObject = {
    docType,
    country,
    documentNumber,
    expiresAt: expiresAt || null,
    files: { front: frontUrl, back: backUrl ?? null, selfie: selfieUrl },
    submittedAt: new Date().toISOString(),
  };

  const user = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: req.user!.id },
      data: {
        kycStatus: "SUBMITTED",
        kycDocuments,
      },
      select: {
        id: true,
        email: true,
        role: true,
        adminSubRole: true,
        isResearcher: true,
        isEmailVerified: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        country: true,
        language: true,
        kycStatus: true,
        isActive: true,
        isBanned: true,
        banReason: true,
        banExpiresAt: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    await tx.notification.create({
      data: {
        userId: req.user!.id,
        type: "KYC_SUBMITTED",
        title: "Dossier KYC recu",
        message: "Votre dossier d'identite est en attente de verification.",
        link: "/mon-compte/kyc",
      },
    });

    return updated;
  });

  res.json(apiResponse(true, user, "KYC submitted"));
});

export const changePassword = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const { currentPassword, password } = req.body;
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, passwordHash: true },
  });

  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ApiError(401, "Current password is invalid");
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  clearRefreshCookie(res);
  clearCsrfCookie(res);
  res.json(apiResponse(true, null, "Password changed successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const [tokenId] = String(payload.tokenId).split(".");
      await prisma.refreshToken.updateMany({
        where: { id: tokenId, userId: payload.sub },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Invalid refresh token is still logged out client-side.
    }
  }

  const accessToken = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice(7)
    : null;
  if (accessToken) {
    await redisSet(`jwt:blacklist:${accessToken}`, "1", "EX", 15 * 60);
  }

  clearRefreshCookie(res);
  clearCsrfCookie(res);
  res.json(apiResponse(true, null, "Logged out"));
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
    throw new ApiError(400, "Invalid or expired verification token");
  }

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: stored.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({ where: { id: payload.sub }, data: { isEmailVerified: true } }),
  ]);

  res.json(apiResponse(true, null, "Email verified"));
});

/**
 * POST /api/auth/resend-verification
 *
 * Re-sends the verification email when the account exists and isn't
 * verified yet. Always responds with the same generic message so this
 * endpoint can't be used to enumerate registered emails.
 */
export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, isEmailVerified: true },
  });

  if (user && !user.isEmailVerified) {
    try {
      const verificationUrl = await createEmailVerification(user.id);
      await sendVerificationEmail(user.email, verificationUrl);
    } catch (error) {
      console.error("Verification email resend failed:", error);
    }
  }

  res.json(apiResponse(true, null, "If the email exists and isn't verified yet, a new link has been sent"));
});

/**
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email when the account exists.
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (user) {
    try {
      const token = signPasswordResetToken(user.id);
      const resetUrl = await createPasswordReset(user.id, token);
      await sendPasswordResetEmail(user.email, resetUrl);
    } catch (error) {
      // Never let an SMTP/email failure leak account existence via a 500
      // response — always fall through to the same generic response below.
      console.error("Password reset email failed:", error);
    }
  }

  res.json(apiResponse(true, null, "If the email exists, a reset link has been sent"));
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
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.passwordResetToken.update({ where: { id: stored.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: payload.sub }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId: payload.sub, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  res.json(apiResponse(true, null, "Password reset successful"));
});

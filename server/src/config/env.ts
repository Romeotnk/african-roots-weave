const requiredInProduction = [
  "DATABASE_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_EMAIL_SECRET",
  "JWT_PASSWORD_RESET_SECRET",
  "CLIENT_URL",
] as const;

const jwtSecretKeys = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_EMAIL_SECRET",
  "JWT_PASSWORD_RESET_SECRET",
] as const;

const isUnsafeSecret = (value: string) =>
  value.length < 32 || value.startsWith("dev_") || value.startsWith("change-me") || value.includes("change-me");

// Environments where weak/placeholder secrets are tolerated. Anything else —
// including typos like "prod" or "Production", or an environment variable
// that was simply never set on the host — is treated as production-grade
// and validated strictly. This is deliberately a whitelist (fail closed),
// not a check for the single string "production" (fail open).
const trustedDevEnvironments = new Set(["development", "test"]);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:4000",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:8080",
  redisUrl: process.env.REDIS_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? "dev_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "dev_refresh_secret",
  jwtEmailSecret: process.env.JWT_EMAIL_SECRET ?? "dev_email_secret",
  jwtPasswordResetSecret: process.env.JWT_PASSWORD_RESET_SECRET ?? "dev_password_reset_secret",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY,
  supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL,
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "Iwosan <no-reply@iwosan.com>",
  },
  contactEmail: process.env.CONTACT_EMAIL ?? "contact@iwosan.africa",
};

export const isTrustedDevEnvironment = () => trustedDevEnvironments.has(env.nodeEnv);

export const validateEnv = () => {
  const unsafeSecrets = jwtSecretKeys.filter((key) => isUnsafeSecret(process.env[key] ?? ""));

  if (!isTrustedDevEnvironment()) {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }

    if (unsafeSecrets.length > 0) {
      throw new Error(
        `Unsafe JWT secret values for NODE_ENV="${env.nodeEnv}": ${unsafeSecrets.join(", ")}. ` +
          "Use long random values (e.g. `openssl rand -hex 32`) for any non-development environment.",
      );
    }
    return;
  }

  if (unsafeSecrets.length > 0) {
    console.warn(
      `[env] Weak JWT secret placeholders in use (${unsafeSecrets.join(", ")}). ` +
        "This is fine for local development only — never deploy with these values.",
    );
  }
};

// These aren't in requiredInProduction because payment/email/media aren't
// hard requirements to boot the app (this deployment intentionally runs
// without real payment integration configured yet) — but silently missing
// them causes confusing failures deep in a request instead of one clear
// message at startup.
const optionalProviderGroups: Record<string, string[]> = {
  Cloudinary: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
  Moneroo: ["MONEROO_API_KEY", "MONEROO_SECRET_KEY", "MONEROO_WEBHOOK_SECRET"],
  SMTP: ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"],
};

export const warnMissingOptionalProviders = () => {
  for (const [provider, keys] of Object.entries(optionalProviderGroups)) {
    const missing = keys.filter((key) => !process.env[key]);
    if (missing.length > 0 && missing.length < keys.length) {
      // Partially configured is worse than not configured at all — it looks
      // ready but will fail unpredictably depending on which call is made.
      console.warn(`[env] ${provider} is partially configured — missing: ${missing.join(", ")}.`);
    } else if (missing.length === keys.length && !isTrustedDevEnvironment()) {
      console.warn(`[env] ${provider} is not configured (${keys.join(", ")} unset) — related features will fail at request time.`);
    }
  }
};
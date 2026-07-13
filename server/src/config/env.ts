const requiredInProduction = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_EMAIL_SECRET",
  "JWT_PASSWORD_RESET_SECRET",
] as const;

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
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? "Iwosan <no-reply@iwosan.com>",
  },
};

export const validateEnv = () => {
  if (env.nodeEnv !== "production") {
    return;
  }

  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

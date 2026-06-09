export const monerooConfig = {
  apiKey: process.env.MONEROO_API_KEY,
  secretKey: process.env.MONEROO_SECRET_KEY,
  webhookSecret: process.env.MONEROO_WEBHOOK_SECRET,
  baseUrl: process.env.MONEROO_BASE_URL ?? 'https://api.moneroo.io',
};

import crypto from "node:crypto";

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const generateReferralCode = (firstName: string, lastName: string) => {
  const prefix = `${firstName}${lastName}`
    .replace(/[^a-z0-9]/gi, "")
    .slice(0, 6)
    .toUpperCase()
    .padEnd(4, "IWO");

  return `${prefix}${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

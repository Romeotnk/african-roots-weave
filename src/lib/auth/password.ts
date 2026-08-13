import type { TFunction } from "i18next";

export const buildPasswordRequirements = (t: TFunction) => [
  { test: (value: string) => value.length >= 8, message: t("password.minLength") },
  { test: (value: string) => /[A-Z]/.test(value), message: t("password.uppercase") },
  { test: (value: string) => /[a-z]/.test(value), message: t("password.lowercase") },
  { test: (value: string) => /[0-9]/.test(value), message: t("password.digit") },
  { test: (value: string) => /[^A-Za-z0-9]/.test(value), message: t("password.specialChar") },
];

export const getPasswordValidationError = (password: string, t: TFunction) =>
  buildPasswordRequirements(t).find((requirement) => !requirement.test(password))?.message ?? null;

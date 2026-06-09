import type { RequestHandler } from "express";

const supportedLanguages = ["fr", "en", "ar"];

export const i18nMiddleware: RequestHandler = (req, _res, next) => {
  const accepted = req.headers["accept-language"]?.split(",")[0]?.split("-")[0]?.toLowerCase();
  req.language = accepted && supportedLanguages.includes(accepted) ? accepted : "fr";
  next();
};

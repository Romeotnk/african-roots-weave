import type { RequestHandler } from "express";

// Applied globally to every request body (see app.ts: app.use(sanitizeMiddleware)),
// so this has to stay narrow: it runs over passwords, free-text search terms and
// every other string field in the app, not just rich-text content, so it must not
// mangle arbitrary "<"/">" characters a user legitimately typed (a full HTML-tag
// stripper like sanitize-html would do exactly that here). It only removes the
// specific constructs that make stored HTML dangerous once rendered — actual rich
// text (e.g. article content, rendered via dangerouslySetInnerHTML) gets sanitized
// properly with sanitize-html at the point it's saved (see content.controller.ts).
const SCRIPT_TAG = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_ATTR = /\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi;
const JS_PROTOCOL_HREF = /((?:href|src)\s*=\s*)(["']?)\s*javascript:[^"'\s>]*/gi;

const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      .replace(SCRIPT_TAG, "")
      .replace(EVENT_HANDLER_ATTR, "")
      .replace(JS_PROTOCOL_HREF, "$1$2")
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)]),
    );
  }

  return value;
};

export const sanitizeMiddleware: RequestHandler = (req, _res, next) => {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query) as typeof req.query;
  req.params = sanitizeValue(req.params) as typeof req.params;
  next();
};

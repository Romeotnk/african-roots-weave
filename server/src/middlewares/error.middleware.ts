import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { apiResponse } from "../utils/apiResponse.js";

export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json(apiResponse(false, null, `Route not found: ${req.method} ${req.originalUrl}`));
};

// Prisma throws its own error classes for known constraint issues — map the
// common ones to the HTTP codes callers actually expect instead of letting
// them all fall through to a generic 500.
const prismaStatusCode = (error: unknown): number | null => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;
  switch (error.code) {
    case "P2002":
      return 409; // Unique constraint violation
    case "P2025":
      return 404; // Record not found
    case "P2003":
      return 409; // Foreign key constraint violation
    default:
      return null;
  }
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const mappedStatus = prismaStatusCode(error);
  const statusCode = mappedStatus ?? (typeof error.statusCode === "number" ? error.statusCode : 500);
  const message = statusCode >= 500 ? "Internal server error" : mappedStatus ? "Resource conflict or not found" : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({ ...apiResponse(false, null, message), code: statusCode });
};

import type { ErrorRequestHandler, RequestHandler } from 'express';
import { apiResponse } from '../utils/apiResponse.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json(apiResponse(false, null, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;
  const message = statusCode >= 500 ? 'Internal server error' : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(apiResponse(false, null, message));
};

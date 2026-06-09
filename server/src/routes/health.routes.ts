import { Router } from 'express';
import { prisma } from '../config/db.js';
import { apiResponse } from '../utils/apiResponse.js';

export const healthRouter = Router();

/**
 * GET /api/health
 *
 * Checks API and database availability.
 *
 * Response example:
 * { "success": true, "data": { "database": "up" }, "message": "Service healthy" }
 *
 * Possible errors:
 * - 503 when the database cannot be reached.
 */
healthRouter.get('/', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json(apiResponse(true, { database: 'up' }, 'Service healthy'));
  } catch (error) {
    next(error);
  }
});

import type { RequestHandler } from "express";
import { matchedData, validationResult } from "express-validator";
import { ApiError } from "../utils/errors.js";

export const validateRequest: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(
      new ApiError(
        422,
        errors
          .array()
          .map((error) => error.msg)
          .join(", "),
      ),
    );
    return;
  }

  req.body = matchedData(req, {
    locations: ["body"],
    includeOptionals: true,
  });

  next();
};

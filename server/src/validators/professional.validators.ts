import { body } from "express-validator";

export const upsertMyProfileValidator = [
  body("displayName").isString().trim().isLength({ min: 3, max: 120 }),
  body("biography").isString().trim().isLength({ min: 300, max: 8000 }),
  body("location").isString().trim().isLength({ min: 2, max: 160 }),
  body("specialty").optional().isArray({ max: 10 }),
  body("specialty.*").optional().isString().trim().isLength({ min: 1, max: 80 }),
  body("initiationPath").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("therapeuticSuccessRate").optional({ nullable: true, checkFalsy: true }).isFloat({ min: 0, max: 100 }),
  body("innovations").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("communityImpact").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("philosophy").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("patientTestimonials").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("caseStudies").optional({ nullable: true, checkFalsy: true }).isString().trim().isLength({ max: 4000 }),
  body("photos").optional().isArray({ max: 10 }),
  body("photos.*").optional().isString(),
  body("serviceBookingEnabled").optional().isBoolean(),
  body("availabilitySchedule").optional().isObject(),
  body("socialLinks").optional().isObject(),
];

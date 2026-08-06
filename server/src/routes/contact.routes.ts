import { Router } from "express";
import { sendContactMessage } from "../controllers/contact.controller.js";
import { contactFormRateLimit } from "../middlewares/rateLimit.middleware.js";

export const contactRouter = Router();

// Public — a visitor reaching /contact may not be logged in, so this must
// not sit behind authMiddleware.
contactRouter.post("/", contactFormRateLimit, sendContactMessage);

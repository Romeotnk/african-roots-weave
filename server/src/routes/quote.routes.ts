import { Router } from "express";
import {
  acceptQuote,
  createQuoteRequest,
  declineQuote,
  listMyQuotes,
  proposeQuote,
} from "../controllers/quote.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified } from "../middlewares/role.middleware.js";

export const quoteRouter = Router();

quoteRouter.use(authMiddleware);
quoteRouter.get("/mine", listMyQuotes);
quoteRouter.post("/", requireEmailVerified, createQuoteRequest);
quoteRouter.post("/:id/propose", requireEmailVerified, proposeQuote);
quoteRouter.post("/:id/decline", requireEmailVerified, declineQuote);
quoteRouter.post("/:id/accept", requireEmailVerified, acceptQuote);

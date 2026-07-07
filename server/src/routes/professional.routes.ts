import { Router } from "express";
import {
  getProfessional,
  listProfessionals,
  listReceivedReviews,
} from "../controllers/professional.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const professionalRouter = Router();

// Public professional directory.
professionalRouter.get("/", listProfessionals);
professionalRouter.get("/me/reviews", authMiddleware, listReceivedReviews);
professionalRouter.get("/:id", getProfessional);

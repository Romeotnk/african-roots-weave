import { Router } from "express";
import { getProfessional, listProfessionals } from "../controllers/professional.controller.js";

export const professionalRouter = Router();

// Public professional directory.
professionalRouter.get("/", listProfessionals);
professionalRouter.get("/:id", getProfessional);

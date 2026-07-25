import { Router } from "express";
import {
  getMyProfile,
  getProfessional,
  listProfessionals,
  listReceivedReviews,
  upsertMyProfile,
  uploadMyProfilePhotos,
  uploadMyVerificationDocs,
} from "../controllers/professional.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { upsertMyProfileValidator } from "../validators/professional.validators.js";

export const professionalRouter = Router();

// Public professional directory.
professionalRouter.get("/", listProfessionals);
professionalRouter.get("/me/reviews", authMiddleware, listReceivedReviews);
professionalRouter.get("/me", authMiddleware, getMyProfile);
professionalRouter.put("/me", authMiddleware, requireEmailVerified, upsertMyProfileValidator, validateRequest, upsertMyProfile);
professionalRouter.post("/me/photos", authMiddleware, requireEmailVerified, upload.array("photos", 10), uploadMyProfilePhotos);
professionalRouter.post("/me/documents", authMiddleware, requireEmailVerified, upload.array("documents", 5), uploadMyVerificationDocs);
professionalRouter.get("/:id", getProfessional);

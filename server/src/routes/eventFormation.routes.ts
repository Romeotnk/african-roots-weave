import { Router } from "express";
import {
  createEvent,
  createFormation,
  downloadFormation,
  enrollFormation,
  getEvent,
  getFormation,
  getMyFormationEnrollment,
  listEvents,
  listFormations,
  listMyEvents,
  listMyFormationEnrollments,
  listMyFormations,
  listMyRegistrations,
  registerEvent,
  unregisterEvent,
  updateEvent,
  updateFormation,
  updateFormationProgress,
} from "../controllers/eventFormation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkPermission, requireEmailVerified } from "../middlewares/role.middleware.js";

export const eventRouter = Router();
export const formationRouter = Router();

// Events.
eventRouter.get("/", listEvents);
eventRouter.get("/mine", authMiddleware, listMyEvents);
eventRouter.get("/registrations/mine", authMiddleware, listMyRegistrations);
eventRouter.get("/:id", getEvent);
eventRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.author"),
  createEvent,
);
eventRouter.put("/:id", authMiddleware, requireEmailVerified, updateEvent);
eventRouter.post("/:id/register", authMiddleware, requireEmailVerified, registerEvent);
eventRouter.delete("/:id/register", authMiddleware, requireEmailVerified, unregisterEvent);

// Training resource library.
formationRouter.get("/", listFormations);
formationRouter.get("/mine", authMiddleware, listMyFormations);
formationRouter.get("/enrollments/mine", authMiddleware, listMyFormationEnrollments);
formationRouter.get("/:id", getFormation);
formationRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.author"),
  createFormation,
);
formationRouter.put(
  "/:id",
  authMiddleware,
  requireEmailVerified,
  checkPermission("content.author"),
  updateFormation,
);
formationRouter.post("/:id/download", authMiddleware, downloadFormation);
formationRouter.get("/:id/enrollment", authMiddleware, getMyFormationEnrollment);
formationRouter.post("/:id/enroll", authMiddleware, requireEmailVerified, enrollFormation);
formationRouter.put("/:id/progress", authMiddleware, requireEmailVerified, updateFormationProgress);

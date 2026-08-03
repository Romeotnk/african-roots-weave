import { Router } from "express";
import {
  createEvent,
  createFormation,
  downloadFormation,
  getEvent,
  getFormation,
  listEvents,
  listFormations,
  listMyEvents,
  listMyFormations,
  listMyRegistrations,
  registerEvent,
  unregisterEvent,
  updateEvent,
  updateFormation,
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
formationRouter.post("/:id/download", downloadFormation);

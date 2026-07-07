import { Role } from "@prisma/client";
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
  registerEvent,
  unregisterEvent,
} from "../controllers/eventFormation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireEmailVerified, roleMiddleware } from "../middlewares/role.middleware.js";

export const eventRouter = Router();
export const formationRouter = Router();

// Events.
eventRouter.get("/", listEvents);
eventRouter.get("/mine", authMiddleware, listMyEvents);
eventRouter.get("/:id", getEvent);
eventRouter.post(
  "/",
  authMiddleware,
  requireEmailVerified,
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.PROFESSIONAL]),
  createEvent,
);
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
  roleMiddleware([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR]),
  createFormation,
);
formationRouter.post("/:id/download", downloadFormation);

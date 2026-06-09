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
  registerEvent,
  unregisterEvent,
} from "../controllers/eventFormation.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

export const eventRouter = Router();
export const formationRouter = Router();

// Events.
eventRouter.get("/", listEvents);
eventRouter.get("/:id", getEvent);
eventRouter.post("/", authMiddleware, roleMiddleware([Role.ADMIN, Role.PROFESSIONAL]), createEvent);
eventRouter.post("/:id/register", authMiddleware, registerEvent);
eventRouter.delete("/:id/register", authMiddleware, unregisterEvent);

// Training resource library.
formationRouter.get("/", listFormations);
formationRouter.get("/:id", getFormation);
formationRouter.post("/", authMiddleware, roleMiddleware([Role.ADMIN]), createFormation);
formationRouter.post("/:id/download", downloadFormation);

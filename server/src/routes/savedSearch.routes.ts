import { Router } from "express";
import {
  createSavedSearch,
  deleteSavedSearch,
  listMySavedSearches,
  updateSavedSearch,
} from "../controllers/savedSearch.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const savedSearchRouter = Router();

savedSearchRouter.use(authMiddleware);
savedSearchRouter.get("/", listMySavedSearches);
savedSearchRouter.post("/", createSavedSearch);
savedSearchRouter.put("/:id", updateSavedSearch);
savedSearchRouter.delete("/:id", deleteSavedSearch);

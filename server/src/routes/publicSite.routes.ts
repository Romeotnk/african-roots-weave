import { Router } from "express";
import { getPublicPage, getPublicSiteConfig } from "../controllers/publicSite.controller.js";

export const publicSiteRouter = Router();

publicSiteRouter.get("/config", getPublicSiteConfig);
publicSiteRouter.get("/pages/:slug", getPublicPage);

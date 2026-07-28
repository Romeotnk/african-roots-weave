import { Router } from "express";
import { getPublicAds, getPublicBanners, getPublicPage, getPublicSiteConfig } from "../controllers/publicSite.controller.js";

export const publicSiteRouter = Router();

publicSiteRouter.get("/config", getPublicSiteConfig);
publicSiteRouter.get("/pages/:slug", getPublicPage);
publicSiteRouter.get("/banners", getPublicBanners);
publicSiteRouter.get("/ads", getPublicAds);

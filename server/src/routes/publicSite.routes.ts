import { Router } from "express";
import {
  getPublicAds,
  getPublicBanners,
  getPublicPage,
  getPublicPartnerLogos,
  getPublicSiteConfig,
  getPublicTaxonomy,
  getPublicTranslations,
} from "../controllers/publicSite.controller.js";

export const publicSiteRouter = Router();

publicSiteRouter.get("/config", getPublicSiteConfig);
publicSiteRouter.get("/pages/:slug", getPublicPage);
publicSiteRouter.get("/banners", getPublicBanners);
publicSiteRouter.get("/partner-logos", getPublicPartnerLogos);
publicSiteRouter.get("/ads", getPublicAds);
publicSiteRouter.get("/taxonomy", getPublicTaxonomy);
publicSiteRouter.get("/translations", getPublicTranslations);

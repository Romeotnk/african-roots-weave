import { Role } from "@prisma/client";
import { Router } from "express";
import {
  approveArticle,
  approveProduct,
  banUser,
  commissionConfig,
  createAd,
  createBanner,
  crudList,
  dashboard,
  deleteAd,
  deleteBanner,
  getUser,
  kycApprove,
  kycDocuments,
  kycReject,
  listSubscriptions,
  listTickets,
  listUsers,
  maintenance,
  newsletterSubscribers,
  pendingArticles,
  pendingProducts,
  pendingProfessionals,
  portraitOfWeek,
  rejectArticle,
  rejectProduct,
  replyTicket,
  sendNewsletter,
  updateAd,
  updateBanner,
  updateCommissionConfig,
  updateConfig,
  updateRole,
  updateSubscription,
  updateTicketStatus,
  verifyProfessional,
} from "../controllers/admin.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, roleMiddleware([Role.ADMIN]));

// Dashboard.
adminRouter.get("/dashboard", dashboard);

// User management.
adminRouter.get("/users", listUsers);
adminRouter.get("/users/:id", getUser);
adminRouter.put("/users/:id/ban", banUser);
adminRouter.put("/users/:id/role", updateRole);
adminRouter.get("/users/:id/kyc-documents", kycDocuments);
adminRouter.put("/users/:id/kyc-approve", kycApprove);
adminRouter.put("/users/:id/kyc-reject", kycReject);

// Moderation.
adminRouter.get("/products/pending", pendingProducts);
adminRouter.put("/products/:id/approve", approveProduct);
adminRouter.put("/products/:id/reject", rejectProduct);
adminRouter.get("/articles/pending", pendingArticles);
adminRouter.put("/articles/:id/approve", approveArticle);
adminRouter.put("/articles/:id/reject", rejectArticle);

// Professionals.
adminRouter.get("/professionals/pending", pendingProfessionals);
adminRouter.put("/professionals/:id/verify", verifyProfessional);
adminRouter.put("/professionals/:id/portrait-of-week", portraitOfWeek);

// Subscriptions and commissions.
adminRouter.get("/subscriptions", listSubscriptions);
adminRouter.put("/subscriptions/:id", updateSubscription);
adminRouter.get("/commissions/config", commissionConfig);
adminRouter.put("/commissions/config", updateCommissionConfig);

// Advertising and site config.
adminRouter.get("/ads", crudList("adSpace"));
adminRouter.post("/ads", createAd);
adminRouter.put("/ads/:id", updateAd);
adminRouter.delete("/ads/:id", deleteAd);
adminRouter.get("/banners", crudList("homeBanner"));
adminRouter.post("/banners", createBanner);
adminRouter.put("/banners/:id", updateBanner);
adminRouter.delete("/banners/:id", deleteBanner);
adminRouter.get("/config", crudList("siteConfig"));
adminRouter.put("/config", updateConfig);
adminRouter.post("/maintenance", maintenance);
adminRouter.post("/custom-css", updateConfig);
adminRouter.post("/custom-js", updateConfig);

// Support and newsletter.
adminRouter.get("/tickets", listTickets);
adminRouter.put("/tickets/:id/status", updateTicketStatus);
adminRouter.post("/tickets/:id/reply", replyTicket);
adminRouter.post("/newsletter/send", sendNewsletter);
adminRouter.get("/newsletter/subscribers", newsletterSubscribers);

import { Role } from "@prisma/client";
import { Router } from "express";
import {
  approveArticle,
  approveProduct,
  auditLog,
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
  promoteUser,
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
  unbanUser,
  verifyProfessional,
} from "../controllers/admin.controller.js";
import {
  hideAnswer,
  hideComment,
  hideQuestion,
  hideReview,
  listAdminComments,
  listAdminQuestions,
  listAdminReviews,
  listReports,
  resolveReport,
} from "../controllers/adminCommunity.controller.js";
import {
  approveRefund,
  listDisputes,
  listRefundRequests,
  listWalletTransactions,
  rejectRefund,
  resolveDispute,
} from "../controllers/adminFinance.controller.js";
import { broadcastNotification } from "../controllers/adminNotification.controller.js";
import { mlmOverview } from "../controllers/adminMlm.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkAdminAccess, checkRole } from "../middlewares/role.middleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, checkAdminAccess);

// Dashboard.
adminRouter.get("/dashboard", dashboard);

// User management.
adminRouter.get("/users", listUsers);
adminRouter.get("/users/:id", getUser);
adminRouter.post("/users/:id/promote", checkRole(Role.SUPER_ADMIN, Role.ADMIN), promoteUser);
adminRouter.put("/users/:id/ban", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR), banUser);
adminRouter.post("/users/:id/ban", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR), banUser);
adminRouter.post("/users/:id/unban", checkRole(Role.SUPER_ADMIN, Role.ADMIN), unbanUser);
adminRouter.put("/users/:id/role", checkRole(Role.SUPER_ADMIN, Role.ADMIN), updateRole);
adminRouter.get(
  "/users/:id/kyc-documents",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN),
  kycDocuments,
);
adminRouter.put("/users/:id/kyc-approve", checkRole(Role.SUPER_ADMIN, Role.ADMIN), kycApprove);
adminRouter.put("/users/:id/kyc-reject", checkRole(Role.SUPER_ADMIN, Role.ADMIN), kycReject);
adminRouter.get("/audit-log", checkRole(Role.SUPER_ADMIN), auditLog);

// Moderation.
adminRouter.get("/products/pending", checkRole(Role.SUPER_ADMIN, Role.ADMIN), pendingProducts);
adminRouter.put("/products/:id/approve", checkRole(Role.SUPER_ADMIN, Role.ADMIN), approveProduct);
adminRouter.put("/products/:id/reject", checkRole(Role.SUPER_ADMIN, Role.ADMIN), rejectProduct);
adminRouter.get("/articles/pending", pendingArticles);
adminRouter.put("/articles/:id/approve", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), approveArticle);
adminRouter.put("/articles/:id/reject", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), rejectArticle);

// Professionals.
adminRouter.get("/professionals/pending", pendingProfessionals);
adminRouter.put(
  "/professionals/:id/verify",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN),
  verifyProfessional,
);
adminRouter.put(
  "/professionals/:id/portrait-of-week",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN),
  portraitOfWeek,
);

// Subscriptions and commissions.
adminRouter.get("/subscriptions", checkRole(Role.SUPER_ADMIN), listSubscriptions);
adminRouter.put("/subscriptions/:id", checkRole(Role.SUPER_ADMIN), updateSubscription);
adminRouter.get("/commissions/config", checkRole(Role.SUPER_ADMIN), commissionConfig);
adminRouter.put("/commissions/config", checkRole(Role.SUPER_ADMIN), updateCommissionConfig);
adminRouter.get("/mlm/overview", checkRole(Role.SUPER_ADMIN, Role.ADMIN), mlmOverview);

// Finances: refunds, disputes, transactions.
adminRouter.get("/refunds", checkRole(Role.SUPER_ADMIN, Role.ADMIN), listRefundRequests);
adminRouter.put("/refunds/:id/approve", checkRole(Role.SUPER_ADMIN, Role.ADMIN), approveRefund);
adminRouter.put("/refunds/:id/reject", checkRole(Role.SUPER_ADMIN, Role.ADMIN), rejectRefund);
adminRouter.get("/disputes", checkRole(Role.SUPER_ADMIN, Role.ADMIN), listDisputes);
adminRouter.put("/disputes/:id/resolve", checkRole(Role.SUPER_ADMIN, Role.ADMIN), resolveDispute);
adminRouter.get("/transactions", checkRole(Role.SUPER_ADMIN, Role.ADMIN), listWalletTransactions);

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
adminRouter.put("/config", checkRole(Role.SUPER_ADMIN), updateConfig);
adminRouter.post("/maintenance", checkRole(Role.SUPER_ADMIN), maintenance);
adminRouter.post("/custom-css", checkRole(Role.SUPER_ADMIN), updateConfig);
adminRouter.post("/custom-js", checkRole(Role.SUPER_ADMIN), updateConfig);

// Community moderation: reports, forum, reviews.
adminRouter.get("/reports", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR), listReports);
adminRouter.put(
  "/reports/:id/resolve",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  resolveReport,
);
adminRouter.get(
  "/forum/questions",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  listAdminQuestions,
);
adminRouter.put(
  "/forum/questions/:id/hide",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  hideQuestion,
);
adminRouter.put(
  "/forum/answers/:id/hide",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  hideAnswer,
);
adminRouter.get(
  "/forum/comments",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  listAdminComments,
);
adminRouter.put(
  "/forum/comments/:id/hide",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  hideComment,
);
adminRouter.get("/reviews", checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR), listAdminReviews);
adminRouter.put(
  "/reviews/:id/hide",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR),
  hideReview,
);

// Support and newsletter.
adminRouter.get("/tickets", listTickets);
adminRouter.put("/tickets/:id/status", updateTicketStatus);
adminRouter.post("/tickets/:id/reply", replyTicket);
adminRouter.post("/newsletter/send", checkRole(Role.SUPER_ADMIN, Role.ADMIN), sendNewsletter);
adminRouter.get("/newsletter/subscribers", newsletterSubscribers);
adminRouter.post(
  "/notifications/broadcast",
  checkRole(Role.SUPER_ADMIN, Role.ADMIN),
  broadcastNotification,
);

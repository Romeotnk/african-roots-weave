import { Role } from "@prisma/client";
import { Router } from "express";
import {
  approveArticle,
  approveEvent,
  approveFormation,
  approveProduct,
  auditLog,
  banUser,
  commissionConfig,
  createAd,
  createBanner,
  createPage,
  crudList,
  dashboard,
  deleteAd,
  deleteBanner,
  deletePage,
  getUser,
  kycApprove,
  kycDocuments,
  kycReject,
  listPages,
  listPermissions,
  listSubscriptions,
  listTickets,
  listUsers,
  maintenance,
  newsletterSubscribers,
  pendingArticles,
  pendingEvents,
  pendingFormations,
  pendingProducts,
  pendingProfessionals,
  portraitOfWeek,
  promoteUser,
  rejectArticle,
  rejectEvent,
  rejectFormation,
  rejectProduct,
  rejectProfessional,
  replyTicket,
  sendNewsletter,
  updateAd,
  updateBanner,
  updateCommissionConfig,
  updateConfig,
  updatePage,
  updateProfessionalCommissionRate,
  updateRole,
  updateRolePermissions,
  updateSubscription,
  updateTicketStatus,
  updateUserPermissionOverrides,
  unbanUser,
  verifyProfessional,
} from "../controllers/admin.controller.js";
import {
  createForumCategory,
  deleteForumCategory,
  hideAnswer,
  hideComment,
  hideQuestion,
  hideReview,
  listAdminComments,
  listAdminForumCategories,
  listAdminQuestions,
  listAdminReviews,
  listReports,
  resolveReport,
  updateForumCategory,
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
import { createTaxonomy, deleteTaxonomy, listAdminTaxonomy, updateTaxonomy } from "../controllers/taxonomy.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkAdminAccess, checkPermission, checkRole } from "../middlewares/role.middleware.js";

export const adminRouter = Router();

adminRouter.use(authMiddleware, checkAdminAccess);

// Dashboard.
adminRouter.get("/dashboard", dashboard);

// User management.
adminRouter.get("/users", listUsers);
adminRouter.get("/users/:id", getUser);
adminRouter.post("/users/:id/promote", checkPermission("users.role.update"), promoteUser);
adminRouter.put("/users/:id/ban", checkPermission("users.ban"), banUser);
adminRouter.post("/users/:id/unban", checkPermission("users.ban"), unbanUser);
adminRouter.put("/users/:id/role", checkPermission("users.role.update"), updateRole);
adminRouter.get(
  "/users/:id/kyc-documents",
  checkPermission("kyc.review"),
  kycDocuments,
);
adminRouter.put("/users/:id/kyc-approve", checkPermission("kyc.review"), kycApprove);
adminRouter.put("/users/:id/kyc-reject", checkPermission("kyc.review"), kycReject);
adminRouter.get("/audit-log", checkPermission("audit.read"), auditLog);
adminRouter.get("/permissions", checkRole(Role.SUPER_ADMIN), listPermissions);
adminRouter.put("/permissions/role/:role", checkRole(Role.SUPER_ADMIN), updateRolePermissions);
adminRouter.patch("/users/:id/permissions", checkRole(Role.SUPER_ADMIN), updateUserPermissionOverrides);

// Moderation.
adminRouter.get("/products/pending", checkPermission("product.moderate"), pendingProducts);
adminRouter.put("/products/:id/approve", checkPermission("product.moderate"), approveProduct);
adminRouter.put("/products/:id/reject", checkPermission("product.moderate"), rejectProduct);
adminRouter.get("/articles/pending", pendingArticles);
adminRouter.put("/articles/:id/approve", checkPermission("content.review"), approveArticle);
adminRouter.put("/articles/:id/reject", checkPermission("content.review"), rejectArticle);
adminRouter.get("/events/pending", checkPermission("content.review"), pendingEvents);
adminRouter.put("/events/:id/approve", checkPermission("content.review"), approveEvent);
adminRouter.put("/events/:id/reject", checkPermission("content.review"), rejectEvent);
adminRouter.get("/formations/pending", checkPermission("content.review"), pendingFormations);
adminRouter.put("/formations/:id/approve", checkPermission("content.review"), approveFormation);
adminRouter.put("/formations/:id/reject", checkPermission("content.review"), rejectFormation);

// Professionals.
adminRouter.get("/professionals/pending", pendingProfessionals);
adminRouter.put(
  "/professionals/:id/verify",
  checkPermission("professionals.verify"),
  verifyProfessional,
);
adminRouter.put(
  "/professionals/:id/reject",
  checkPermission("professionals.verify"),
  rejectProfessional,
);
adminRouter.put(
  "/professionals/:id/portrait-of-week",
  checkPermission("professionals.verify"),
  portraitOfWeek,
);
adminRouter.put(
  "/professionals/:id/commission-rate",
  checkRole(Role.SUPER_ADMIN),
  updateProfessionalCommissionRate,
);

// Subscriptions and commissions.
adminRouter.get("/subscriptions", checkRole(Role.SUPER_ADMIN), listSubscriptions);
adminRouter.put("/subscriptions/:id", checkRole(Role.SUPER_ADMIN), updateSubscription);
adminRouter.get("/commissions/config", checkPermission("finance.config"), commissionConfig);
adminRouter.put("/commissions/config", checkPermission("finance.config"), updateCommissionConfig);
adminRouter.get("/mlm/overview", checkPermission("finance.reports.view"), mlmOverview);

// Finances: refunds, disputes, transactions.
adminRouter.get("/refunds", checkPermission("finance.refund.approve"), listRefundRequests);
adminRouter.put("/refunds/:id/approve", checkPermission("finance.refund.approve"), approveRefund);
adminRouter.put("/refunds/:id/reject", checkPermission("finance.refund.approve"), rejectRefund);
adminRouter.get("/disputes", checkPermission("finance.dispute.resolve"), listDisputes);
adminRouter.put("/disputes/:id/resolve", checkPermission("finance.dispute.resolve"), resolveDispute);
adminRouter.get("/transactions", checkPermission("finance.reports.view"), listWalletTransactions);

// Advertising and site config.
adminRouter.get("/ads", crudList("adSpace"));
adminRouter.post("/ads", createAd);
adminRouter.put("/ads/:id", updateAd);
adminRouter.delete("/ads/:id", deleteAd);
adminRouter.get("/banners", crudList("homeBanner"));
adminRouter.post("/banners", createBanner);
adminRouter.put("/banners/:id", updateBanner);
adminRouter.delete("/banners/:id", deleteBanner);
adminRouter.get("/pages", listPages);
adminRouter.post("/pages", checkPermission("content.pages.manage"), createPage);
adminRouter.put("/pages/:id", checkPermission("content.pages.manage"), updatePage);
adminRouter.delete("/pages/:id", checkPermission("content.pages.manage"), deletePage);
adminRouter.get("/config", crudList("siteConfig"));
adminRouter.put("/config", checkPermission("system.config"), updateConfig);
adminRouter.post("/maintenance", checkPermission("system.config"), maintenance);
adminRouter.post("/custom-css", checkPermission("system.config"), updateConfig);
adminRouter.post("/custom-js", checkPermission("system.config"), updateConfig);

// Community moderation: reports, forum, reviews.
adminRouter.get("/reports", checkPermission("forum.moderate"), listReports);
adminRouter.put(
  "/reports/:id/resolve",
  checkPermission("forum.moderate"),
  resolveReport,
);
adminRouter.get(
  "/forum/questions",
  checkPermission("forum.moderate"),
  listAdminQuestions,
);
adminRouter.put(
  "/forum/questions/:id/hide",
  checkPermission("forum.moderate"),
  hideQuestion,
);
adminRouter.put(
  "/forum/answers/:id/hide",
  checkPermission("forum.moderate"),
  hideAnswer,
);
adminRouter.get(
  "/forum/comments",
  checkPermission("forum.moderate"),
  listAdminComments,
);
adminRouter.put(
  "/forum/comments/:id/hide",
  checkPermission("forum.moderate"),
  hideComment,
);
adminRouter.get(
  "/forum/categories",
  checkPermission("forum.moderate"),
  listAdminForumCategories,
);
adminRouter.post(
  "/forum/categories",
  checkPermission("forum.moderate"),
  createForumCategory,
);
adminRouter.put(
  "/forum/categories/:id",
  checkPermission("forum.moderate"),
  updateForumCategory,
);
adminRouter.delete(
  "/forum/categories/:id",
  checkPermission("forum.moderate"),
  deleteForumCategory,
);
adminRouter.get("/taxonomy", checkPermission("content.review"), listAdminTaxonomy);
adminRouter.post("/taxonomy", checkPermission("content.review"), createTaxonomy);
adminRouter.put("/taxonomy/:id", checkPermission("content.review"), updateTaxonomy);
adminRouter.delete("/taxonomy/:id", checkPermission("content.review"), deleteTaxonomy);
adminRouter.get("/reviews", checkPermission("forum.moderate"), listAdminReviews);
adminRouter.put(
  "/reviews/:id/hide",
  checkPermission("forum.moderate"),
  hideReview,
);

// Support and newsletter.
adminRouter.get("/tickets", checkPermission("support.triage"), listTickets);
adminRouter.put("/tickets/:id/status", checkPermission("support.triage"), updateTicketStatus);
adminRouter.post("/tickets/:id/reply", checkPermission("support.triage"), replyTicket);
adminRouter.post("/newsletter/send", checkPermission("marketing.newsletter.send"), sendNewsletter);
adminRouter.get("/newsletter/subscribers", newsletterSubscribers);
adminRouter.post(
  "/notifications/broadcast",
  checkPermission("marketing.newsletter.send"),
  broadcastNotification,
);

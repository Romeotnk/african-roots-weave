import { AdminSubRole, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { sendEmail } from "../services/email.service.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const adminAssignableRoles: Role[] = [Role.MODERATOR, Role.EDITOR, Role.RESEARCHER];

const assertCanTouchUser = async (actorRole: Role, targetId: string) => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });

  if (!target) throw new ApiError(404, "User not found");
  if (target.role === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
    throw new ApiError(403, "Accès non autorisé");
  }

  return target;
};

export const dashboard = asyncHandler(async (_req, res) => {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [
    totalUsers,
    revenue,
    activeListings,
    pendingKYC,
    openTickets,
    newUsersToday,
    topCategories,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "DELIVERED"] }, createdAt: { gte: since30 } },
      _sum: { commissionAmount: true },
    }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { kycStatus: "SUBMITTED" } }),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.product.groupBy({
      by: ["category"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    }),
  ]);

  res.json(
    apiResponse(
      true,
      {
        totalUsers,
        revenue: revenue._sum.commissionAmount,
        activeListings,
        pendingKYC,
        openTickets,
        newUsersToday,
        topCategories,
        revenueChart: [],
      },
      "Admin dashboard retrieved",
    ),
  );
});

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search ?? "");
  const where = {
    role: req.query.role as Role | undefined,
    kycStatus: req.query.kyc as never,
    isBanned: req.query.banned === "true" ? true : req.query.banned === "false" ? false : undefined,
    OR: search
      ? [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
        ]
      : undefined,
  };
  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      omit: { passwordHash: true },
    }),
    prisma.user.count({ where }),
  ]);
  res.json(apiResponse(true, users, "Users retrieved", paginationMeta(page, limit, total)));
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    omit: { passwordHash: true },
    include: { professionalProfile: true, subscription: true, mlmNode: true },
  });
  res.json(apiResponse(true, user, "User retrieved"));
});

export const banUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await assertCanTouchUser(req.user.role, req.params.id);

  const duration = req.body.duration ? Number(req.body.duration) : null;
  const banExpiresAt = duration ? new Date(Date.now() + duration * 60 * 60 * 1000) : null;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBanned: true, banReason: req.body.reason, banExpiresAt },
  });
  await writeAuditLog(req, {
    action: "USER_BANNED",
    targetId: user.id,
    targetType: "User",
    metadata: { reason: req.body.reason, duration },
  });
  res.json(apiResponse(true, user, "User banned"));
});

export const updateRole = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await assertCanTouchUser(req.user.role, req.params.id);

  const nextRole = req.body.role as Role;
  const nextSubRole = req.body.subRole as AdminSubRole | undefined;

  if (!Object.values(Role).includes(nextRole)) {
    throw new ApiError(400, "Invalid role");
  }

  if (req.user.role !== Role.SUPER_ADMIN && !adminAssignableRoles.includes(nextRole)) {
    throw new ApiError(403, "Accès non autorisé");
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      role: nextRole,
      adminSubRole: nextSubRole ?? (nextRole === Role.MODERATOR ? "MODERATOR" : nextRole === Role.EDITOR ? "EDITOR" : null),
      isResearcher: nextRole === Role.RESEARCHER || Boolean(req.body.isResearcher),
    },
  });
  await writeAuditLog(req, {
    action: "USER_ROLE_UPDATED",
    targetId: user.id,
    targetType: "User",
    metadata: { role: nextRole, subRole: nextSubRole },
  });
  res.json(apiResponse(true, user, "User role updated"));
});

export const promoteUser = updateRole;

export const unbanUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await assertCanTouchUser(req.user.role, req.params.id);

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isBanned: false, banReason: null, banExpiresAt: null },
  });
  await writeAuditLog(req, { action: "USER_UNBANNED", targetId: user.id, targetType: "User" });
  res.json(apiResponse(true, user, "User unbanned"));
});

export const auditLog = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    userId: typeof req.query.userId === "string" ? req.query.userId : undefined,
    action: typeof req.query.action === "string" ? req.query.action : undefined,
  };

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json(apiResponse(true, logs, "Audit log retrieved", paginationMeta(page, limit, total)));
});

export const kycDocuments = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, kycDocuments: true, kycStatus: true },
  });
  res.json(apiResponse(true, user, "KYC documents retrieved"));
});

export const kycApprove = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { kycStatus: "VERIFIED" },
  });
  res.json(apiResponse(true, user, "KYC approved"));
});

export const kycReject = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { kycStatus: "REJECTED" },
  });
  res.json(apiResponse(true, user, "KYC rejected"));
});

export const pendingProducts = asyncHandler(async (_req, res) => {
  res.json(
    apiResponse(
      true,
      await prisma.product.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: "desc" },
      }),
      "Pending products retrieved",
    ),
  );
});

export const approveProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isApproved: true, isActive: true },
  });
  res.json(apiResponse(true, product, "Product approved"));
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isApproved: false, isActive: false },
  });
  res.json(apiResponse(true, product, "Product rejected"));
});

export const pendingArticles = asyncHandler(async (_req, res) => {
  res.json(
    apiResponse(
      true,
      await prisma.article.findMany({
        where: { isApproved: false },
        orderBy: { createdAt: "desc" },
      }),
      "Pending articles retrieved",
    ),
  );
});

export const approveArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { isApproved: true },
  });
  res.json(apiResponse(true, article, "Article approved"));
});

export const rejectArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { isApproved: false, isPublished: false },
  });
  res.json(apiResponse(true, article, "Article rejected"));
});

export const pendingProfessionals = asyncHandler(async (_req, res) => {
  const profiles = await prisma.professionalProfile.findMany({
    where: { isVerified: false },
    include: { user: { omit: { passwordHash: true } } },
  });
  res.json(apiResponse(true, profiles, "Pending professionals retrieved"));
});

export const verifyProfessional = asyncHandler(async (req, res) => {
  const profile = await prisma.professionalProfile.update({
    where: { id: req.params.id },
    data: { isVerified: true, verifiedAt: new Date() },
  });
  res.json(apiResponse(true, profile, "Professional verified"));
});

export const portraitOfWeek = asyncHandler(async (req, res) => {
  const profile = await prisma.professionalProfile.update({
    where: { id: req.params.id },
    data: {
      isPortraitOfWeek: true,
      portraitStartDate: new Date(req.body.startDate),
      portraitEndDate: new Date(req.body.endDate),
    },
  });
  res.json(apiResponse(true, profile, "Portrait of week configured"));
});

export const listSubscriptions = asyncHandler(async (_req, res) => {
  res.json(
    apiResponse(
      true,
      await prisma.subscription.findMany({ include: { user: { omit: { passwordHash: true } } } }),
      "Subscriptions retrieved",
    ),
  );
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const subscription = await prisma.subscription.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(apiResponse(true, subscription, "Subscription updated"));
});

export const commissionConfig = asyncHandler(async (_req, res) => {
  const config = await prisma.siteConfig.findMany({
    where: { key: { startsWith: "commission." } },
  });
  res.json(apiResponse(true, config, "Commission config retrieved"));
});

export const updateCommissionConfig = asyncHandler(async (req, res) => {
  const entries = await Promise.all(
    Object.entries(req.body).map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key: `commission.${key}` },
        update: { value: String(value), updatedById: req.user!.id },
        create: { key: `commission.${key}`, value: String(value), updatedById: req.user!.id },
      }),
    ),
  );
  res.json(apiResponse(true, entries, "Commission config updated"));
});

export const crudList = (model: "adSpace" | "homeBanner" | "siteConfig") =>
  asyncHandler(async (_req, res) =>
    res.json(
      apiResponse(
        true,
        await (prisma[model] as never as { findMany: () => Promise<unknown> }).findMany(),
        "Items retrieved",
      ),
    ),
  );

export const createAd = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json(apiResponse(true, await prisma.adSpace.create({ data: req.body }), "Ad created")),
);
export const updateAd = asyncHandler(async (req, res) =>
  res.json(
    apiResponse(
      true,
      await prisma.adSpace.update({ where: { id: req.params.id }, data: req.body }),
      "Ad updated",
    ),
  ),
);
export const deleteAd = asyncHandler(async (req, res) => {
  await prisma.adSpace.delete({ where: { id: req.params.id } });
  res.json(apiResponse(true, null, "Ad deleted"));
});

export const createBanner = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json(apiResponse(true, await prisma.homeBanner.create({ data: req.body }), "Banner created")),
);
export const updateBanner = asyncHandler(async (req, res) =>
  res.json(
    apiResponse(
      true,
      await prisma.homeBanner.update({ where: { id: req.params.id }, data: req.body }),
      "Banner updated",
    ),
  ),
);
export const deleteBanner = asyncHandler(async (req, res) => {
  await prisma.homeBanner.delete({ where: { id: req.params.id } });
  res.json(apiResponse(true, null, "Banner deleted"));
});

export const updateConfig = asyncHandler(async (req, res) => {
  const entries = await Promise.all(
    Object.entries(req.body).map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        update: { value: String(value), updatedById: req.user!.id },
        create: { key, value: String(value), updatedById: req.user!.id },
      }),
    ),
  );
  res.json(apiResponse(true, entries, "Config updated"));
});

export const maintenance = asyncHandler(async (req, res) => {
  const config = await prisma.siteConfig.upsert({
    where: { key: "maintenance.enabled" },
    update: { value: String(Boolean(req.body.enabled)), updatedById: req.user!.id },
    create: {
      key: "maintenance.enabled",
      value: String(Boolean(req.body.enabled)),
      updatedById: req.user!.id,
    },
  });
  res.json(apiResponse(true, config, "Maintenance mode updated"));
});

export const listTickets = asyncHandler(async (_req, res) => {
  res.json(
    apiResponse(
      true,
      await prisma.ticket.findMany({ include: { messages: true }, orderBy: { createdAt: "desc" } }),
      "Tickets retrieved",
    ),
  );
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id },
    data: { status: req.body.status },
  });
  res.json(apiResponse(true, ticket, "Ticket status updated"));
});

export const replyTicket = asyncHandler(async (req, res) => {
  const message = await prisma.ticketMessage.create({
    data: { ticketId: req.params.id, authorId: req.user!.id, content: req.body.content },
  });
  res.status(201).json(apiResponse(true, message, "Ticket reply created"));
});

export const sendNewsletter = asyncHandler(async (req, res) => {
  const subscribers = await prisma.newsletterSubscriber.findMany({ where: { isActive: true } });
  await Promise.all(
    subscribers.map((subscriber) =>
      sendEmail({ to: subscriber.email, subject: req.body.subject, html: req.body.html }),
    ),
  );
  res.json(apiResponse(true, { sent: subscribers.length }, "Newsletter sent"));
});

export const newsletterSubscribers = asyncHandler(async (_req, res) => {
  res.json(
    apiResponse(
      true,
      await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" } }),
      "Subscribers retrieved",
    ),
  );
});

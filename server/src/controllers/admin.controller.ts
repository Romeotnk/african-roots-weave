import { AdminSubRole, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { sendEmail } from "../services/email.service.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";
import { sanitizeRichText } from "../utils/sanitizeRichText.js";

const adminAssignableRoles: Role[] = [Role.MODERATOR, Role.EDITOR, Role.RESEARCHER];

// Higher rank = more authority. SUPER_ADMIN always bypasses this check.
// Anyone else may only act on a target strictly below their own rank, so a
// MODERATOR can never ban/promote/demote another MODERATOR, an ADMIN, or a
// SUPER_ADMIN.
const roleRank: Record<Role, number> = {
  [Role.SUPER_ADMIN]: 4,
  [Role.ADMIN]: 3,
  [Role.MODERATOR]: 2,
  [Role.EDITOR]: 2,
  [Role.RESEARCHER]: 1,
  [Role.PROFESSIONAL]: 1,
  [Role.USER]: 0,
};

const assertCanTouchUser = async (actorRole: Role, targetId: string) => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    select: { id: true, role: true },
  });

  if (!target) throw new ApiError(404, "User not found");
  if (actorRole !== Role.SUPER_ADMIN && roleRank[target.role] >= roleRank[actorRole]) {
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
      omit: { passwordHash: true, kycDocuments: true },
    }),
    prisma.user.count({ where }),
  ]);
  res.json(apiResponse(true, users, "Users retrieved", paginationMeta(page, limit, total)));
});

export const getUser = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  // EDITOR is an editorial role with no need to see ban reasons or wallet
  // balances — only the roles that actually act on moderation/finance see them.
  const canViewSensitive: boolean = ([Role.SUPER_ADMIN, Role.ADMIN, Role.MODERATOR] as Role[]).includes(req.user.role);
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    omit: {
      passwordHash: true,
      kycDocuments: true,
      ...(canViewSensitive ? {} : { banReason: true, walletBalance: true }),
    },
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
  if (nextSubRole !== undefined && !Object.values(AdminSubRole).includes(nextSubRole)) {
    throw new ApiError(400, "Invalid sub-role");
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
  await writeAuditLog(req, { action: "KYC_APPROVED", targetId: user.id, targetType: "User" });
  res.json(apiResponse(true, user, "KYC approved"));
});

export const kycReject = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { kycStatus: "REJECTED" },
  });
  await writeAuditLog(req, {
    action: "KYC_REJECTED",
    targetId: user.id,
    targetType: "User",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, user, "KYC rejected"));
});

export const pendingProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isApproved: false, isActive: true };
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.product.count({ where }),
  ]);
  res.json(apiResponse(true, products, "Pending products retrieved", paginationMeta(page, limit, total)));
});

export const approveProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isApproved: true, isActive: true },
  });
  await writeAuditLog(req, { action: "PRODUCT_APPROVED", targetId: product.id, targetType: "Product" });
  res.json(apiResponse(true, product, "Product approved"));
});

export const rejectProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: { isApproved: false, isActive: false },
  });
  await writeAuditLog(req, {
    action: "PRODUCT_REJECTED",
    targetId: product.id,
    targetType: "Product",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, product, "Product rejected"));
});

export const pendingArticles = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isApproved: false, rejectedAt: null };
  const [articles, total] = await prisma.$transaction([
    prisma.article.findMany({ where, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.article.count({ where }),
  ]);
  res.json(apiResponse(true, articles, "Pending articles retrieved", paginationMeta(page, limit, total)));
});

export const approveArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { isApproved: true, rejectedAt: null },
  });
  await writeAuditLog(req, { action: "ARTICLE_APPROVED", targetId: article.id, targetType: "Article" });
  res.json(apiResponse(true, article, "Article approved"));
});

export const rejectArticle = asyncHandler(async (req, res) => {
  const article = await prisma.article.update({
    where: { id: req.params.id },
    data: { isApproved: false, isPublished: false, rejectedAt: new Date() },
  });
  await writeAuditLog(req, {
    action: "ARTICLE_REJECTED",
    targetId: article.id,
    targetType: "Article",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, article, "Article rejected"));
});

export const pendingEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isPublished: false, rejectedAt: null };
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.event.count({ where }),
  ]);
  res.json(apiResponse(true, events, "Pending events retrieved", paginationMeta(page, limit, total)));
});

export const approveEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.update({ where: { id: req.params.id }, data: { isPublished: true, rejectedAt: null } });
  await writeAuditLog(req, { action: "EVENT_APPROVED", targetId: event.id, targetType: "Event" });
  res.json(apiResponse(true, event, "Event approved"));
});

export const rejectEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.update({ where: { id: req.params.id }, data: { isPublished: false, rejectedAt: new Date() } });
  await writeAuditLog(req, {
    action: "EVENT_REJECTED",
    targetId: event.id,
    targetType: "Event",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, event, "Event rejected"));
});

export const pendingFormations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isPublished: false, rejectedAt: null };
  const [formations, total] = await prisma.$transaction([
    prisma.formation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { createdBy: { select: { id: true, firstName: true, lastName: true, role: true } } },
    }),
    prisma.formation.count({ where }),
  ]);
  res.json(apiResponse(true, formations, "Pending formations retrieved", paginationMeta(page, limit, total)));
});

export const approveFormation = asyncHandler(async (req, res) => {
  const formation = await prisma.formation.update({ where: { id: req.params.id }, data: { isPublished: true, rejectedAt: null } });
  await writeAuditLog(req, { action: "FORMATION_APPROVED", targetId: formation.id, targetType: "Formation" });
  res.json(apiResponse(true, formation, "Formation approved"));
});

export const rejectFormation = asyncHandler(async (req, res) => {
  const formation = await prisma.formation.update({ where: { id: req.params.id }, data: { isPublished: false, rejectedAt: new Date() } });
  await writeAuditLog(req, {
    action: "FORMATION_REJECTED",
    targetId: formation.id,
    targetType: "Formation",
    metadata: { reason: req.body.reason },
  });
  res.json(apiResponse(true, formation, "Formation rejected"));
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
  await writeAuditLog(req, { action: "PROFESSIONAL_VERIFIED", targetId: profile.id, targetType: "ProfessionalProfile" });
  res.json(apiResponse(true, profile, "Professional verified"));
});

export const rejectProfessional = asyncHandler(async (req, res) => {
  const profile = await prisma.professionalProfile.delete({ where: { id: req.params.id } });
  await writeAuditLog(req, {
    action: "PROFESSIONAL_REJECTED",
    targetId: profile.id,
    targetType: "ProfessionalProfile",
    metadata: { reason: req.body.reason, displayName: profile.displayName },
  });
  res.json(apiResponse(true, null, "Professional application rejected"));
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
  await writeAuditLog(req, { action: "PORTRAIT_OF_WEEK_SET", targetId: profile.id, targetType: "ProfessionalProfile" });
  res.json(apiResponse(true, profile, "Portrait of week configured"));
});

export const listSubscriptions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [subscriptions, total] = await prisma.$transaction([
    prisma.subscription.findMany({
      include: { user: { omit: { passwordHash: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.subscription.count(),
  ]);
  res.json(apiResponse(true, subscriptions, "Subscriptions retrieved", paginationMeta(page, limit, total)));
});

export const updateSubscription = asyncHandler(async (req, res) => {
  const { plan, price, endDate, isActive, maxListings, maxDownloads, autoRenew } = req.body as {
    plan?: string;
    price?: number | string;
    endDate?: string;
    isActive?: boolean;
    maxListings?: number;
    maxDownloads?: number;
    autoRenew?: boolean;
  };
  const subscription = await prisma.subscription.update({
    where: { id: req.params.id },
    data: {
      plan: plan as never,
      price: price !== undefined ? String(price) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isActive,
      maxListings,
      maxDownloads,
      autoRenew,
    },
  });
  await writeAuditLog(req, { action: "SUBSCRIPTION_UPDATED", targetId: subscription.id, targetType: "Subscription" });
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

const adFields = (body: Record<string, unknown>) => ({
  name: body.name as string | undefined,
  position: body.position as string | undefined,
  code: body.code as string | undefined,
  isActive: body.isActive as boolean | undefined,
});

export const createAd = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json(apiResponse(true, await prisma.adSpace.create({ data: adFields(req.body) as never }), "Ad created")),
);
export const updateAd = asyncHandler(async (req, res) =>
  res.json(
    apiResponse(
      true,
      await prisma.adSpace.update({ where: { id: req.params.id }, data: adFields(req.body) }),
      "Ad updated",
    ),
  ),
);
export const deleteAd = asyncHandler(async (req, res) => {
  await prisma.adSpace.delete({ where: { id: req.params.id } });
  res.json(apiResponse(true, null, "Ad deleted"));
});

const bannerFields = (body: Record<string, unknown>) => ({
  imageUrl: body.imageUrl as string | undefined,
  title: body.title as string | undefined,
  link: body.link as string | undefined,
  order: body.order as number | undefined,
  isActive: body.isActive as boolean | undefined,
});

export const createBanner = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json(apiResponse(true, await prisma.homeBanner.create({ data: bannerFields(req.body) as never }), "Banner created")),
);
export const updateBanner = asyncHandler(async (req, res) =>
  res.json(
    apiResponse(
      true,
      await prisma.homeBanner.update({ where: { id: req.params.id }, data: bannerFields(req.body) }),
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
  await writeAuditLog(req, { action: "SITE_CONFIG_UPDATED", metadata: { keys: Object.keys(req.body) } });
  res.json(apiResponse(true, entries, "Config updated"));
});

export const maintenance = asyncHandler(async (req, res) => {
  const entries = await Promise.all(
    [
      ["maintenance.enabled", String(Boolean(req.body.enabled))],
      ...(req.body.message ? [["maintenance.message", String(req.body.message)]] : []),
      ...(req.body.returnAt ? [["maintenance.returnAt", String(req.body.returnAt)]] : []),
    ].map(([key, value]) =>
      prisma.siteConfig.upsert({
        where: { key },
        update: { value, updatedById: req.user!.id },
        create: { key, value, updatedById: req.user!.id },
      }),
    ),
  );
  await writeAuditLog(req, {
    action: "MAINTENANCE_MODE_UPDATED",
    metadata: { enabled: Boolean(req.body.enabled) },
  });
  res.json(apiResponse(true, entries, "Maintenance mode updated"));
});

export const listTickets = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({ include: { messages: true }, orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.ticket.count(),
  ]);
  res.json(apiResponse(true, tickets, "Tickets retrieved", paginationMeta(page, limit, total)));
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
  const html = sanitizeRichText(String(req.body.html ?? ""));
  const subscribers = await prisma.newsletterSubscriber.findMany({ where: { isActive: true } });
  await Promise.all(
    subscribers.map((subscriber) =>
      sendEmail({ to: subscriber.email, subject: req.body.subject, html }),
    ),
  );
  await writeAuditLog(req, {
    action: "NEWSLETTER_SENT",
    metadata: { subject: req.body.subject, recipientCount: subscribers.length },
  });
  res.json(apiResponse(true, { sent: subscribers.length }, "Newsletter sent"));
});

export const newsletterSubscribers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const [subscribers, total] = await prisma.$transaction([
    prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: "desc" }, skip, take: limit }),
    prisma.newsletterSubscriber.count(),
  ]);
  res.json(apiResponse(true, subscribers, "Subscribers retrieved", paginationMeta(page, limit, total)));
});

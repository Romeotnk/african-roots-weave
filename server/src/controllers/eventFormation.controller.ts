import { Prisma, Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { initiateMonerooPayment } from "../services/moneroo.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { demoOwnerFilter, isDemoHidden } from "../utils/demoMode.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const canPublishProgramming = (role: Role) => role === Role.SUPER_ADMIN || role === Role.ADMIN;

export const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isPublished: true, type: req.query.type as never, ...(await demoOwnerFilter("createdBy")) };
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({ where, skip, take: limit, orderBy: { startDate: "asc" } }),
    prisma.event.count({ where }),
  ]);
  res.json(apiResponse(true, events, "Events retrieved", paginationMeta(page, limit, total)));
});

export const listMyEvents = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { page, limit, skip } = getPagination(req.query);
  const where = { createdById: req.user.id };

  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startDate: "asc" },
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.event.count({ where }),
  ]);
  const eventsWithRegistrationCount = events.map(({ _count, ...event }) => ({
    ...event,
    registrations: Array.from({ length: _count.registrations }),
  }));

  res.json(apiResponse(true, eventsWithRegistrationCount, "My events retrieved", paginationMeta(page, limit, total)));
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { registrations: true, createdBy: { select: { isDemoAccount: true } } },
  });
  if (!event || !event.isPublished || (event.createdBy.isDemoAccount && (await isDemoHidden()))) {
    throw new ApiError(404, "Event not found");
  }
  const { createdBy: _createdBy, ...eventData } = event;
  res.json(apiResponse(true, eventData, "Event retrieved"));
});

export const createEvent = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const event = await prisma.event.create({
    data: {
      ...req.body,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      createdById: req.user.id,
      isPublished: canPublishProgramming(req.user.role) && Boolean(req.body.isPublished),
      rejectedAt: null,
    },
  });
  res.status(201).json(apiResponse(true, event, "Event created"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.event.findUnique({ where: { id: req.params.id }, select: { createdById: true } });
  if (!existing) throw new ApiError(404, "Event not found");
  if (existing.createdById !== req.user.id && !canPublishProgramming(req.user.role)) {
    throw new ApiError(403, "Forbidden");
  }

  const { startDate, endDate, isPublished, createdById, ...rest } = req.body as {
    startDate?: string;
    endDate?: string;
    isPublished?: boolean;
    createdById?: string;
  };
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      isPublished:
        isPublished === undefined ? undefined : canPublishProgramming(req.user.role) ? isPublished : false,
      rejectedAt: isPublished === undefined ? undefined : null,
    },
  });
  res.json(apiResponse(true, event, "Event updated"));
});

export const listMyRegistrations = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const registrations = await prisma.eventRegistration.findMany({
    where: { userId: req.user.id },
    include: { event: true },
    orderBy: { event: { startDate: "asc" } },
  });
  res.json(apiResponse(true, registrations, "My registrations retrieved"));
});

export const registerEvent = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const registration = await prisma.eventRegistration.create({
    data: { eventId: req.params.id, userId: req.user.id },
  });
  res.status(201).json(apiResponse(true, registration, "Event registration created"));
});

export const unregisterEvent = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  await prisma.eventRegistration.delete({
    where: { eventId_userId: { eventId: req.params.id, userId: req.user.id } },
  });
  res.json(apiResponse(true, null, "Event registration removed"));
});

export const listFormations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {
    isPublished: true,
    type: req.query.type as never,
    category: req.query.category as string | undefined,
    tags: req.query.tag ? { has: String(req.query.tag) } : undefined,
    createdById: typeof req.query.createdById === "string" ? req.query.createdById : undefined,
    ...(await demoOwnerFilter("createdBy")),
  };
  const [formations, total] = await prisma.$transaction([
    prisma.formation.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.formation.count({ where }),
  ]);
  res.json(
    apiResponse(true, formations, "Formations retrieved", paginationMeta(page, limit, total)),
  );
});

export const listMyFormations = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const { page, limit, skip } = getPagination(req.query);
  const where = { createdById: req.user.id };

  const [formations, total] = await prisma.$transaction([
    prisma.formation.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true } } },
    }),
    prisma.formation.count({ where }),
  ]);

  const revenueByFormation = formations.length
    ? await prisma.formationEnrollment.groupBy({
        by: ["formationId"],
        where: { formationId: { in: formations.map((formation) => formation.id) } },
        _sum: { pricePaid: true },
      })
    : [];
  const revenueByFormationId = new Map(revenueByFormation.map((row) => [row.formationId, row._sum.pricePaid ?? 0]));

  const formationsWithSales = formations.map(({ _count, ...formation }) => ({
    ...formation,
    enrollmentCount: _count.enrollments,
    revenue: revenueByFormationId.get(formation.id) ?? 0,
  }));

  res.json(
    apiResponse(true, formationsWithSales, "My formations retrieved", paginationMeta(page, limit, total)),
  );
});

export const getFormation = asyncHandler(async (req, res) => {
  const formation = await prisma.formation.findFirst({
    where: { OR: [{ id: req.params.id }, { slug: req.params.id }] },
    include: {
      modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } },
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isDemoAccount: true,
          professionalProfile: { select: { id: true, displayName: true, photos: true } },
        },
      },
    },
  });
  if (!formation || !formation.isPublished || (formation.createdBy.isDemoAccount && (await isDemoHidden()))) {
    throw new ApiError(404, "Formation not found");
  }
  const { isDemoAccount: _isDemoAccount, ...createdBy } = formation.createdBy;

  const [reviews, reviewAgg] = await Promise.all([
    prisma.review.findMany({
      where: { targetId: formation.id, targetType: "FORMATION", isHidden: false },
      include: { author: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.review.aggregate({
      where: { targetId: formation.id, targetType: "FORMATION", isHidden: false },
      _avg: { rating: true },
      _count: { id: true },
    }),
  ]);

  res.json(
    apiResponse(
      true,
      { ...formation, createdBy, reviews, rating: reviewAgg._avg.rating ?? 0, reviewCount: reviewAgg._count.id },
      "Formation retrieved",
    ),
  );
});

type ModuleInput = { title: string; order?: number; lessons?: LessonInput[] };
type LessonInput = { title: string; duration?: string; type?: string; order?: number; contentUrl?: string };

const buildModulesCreateInput = (modules: ModuleInput[] | undefined) =>
  modules?.map((module, moduleIndex) => ({
    title: module.title,
    order: module.order ?? moduleIndex,
    lessons: {
      create: (module.lessons ?? []).map((lesson, lessonIndex) => ({
        title: lesson.title,
        duration: lesson.duration,
        type: lesson.type ?? "video",
        order: lesson.order ?? lessonIndex,
        contentUrl: lesson.contentUrl,
      })),
    },
  }));

export const createFormation = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const modules = req.body.modules as ModuleInput[] | undefined;
  const rest = { ...req.body };
  delete rest.modules;
  delete rest.createdById;
  delete rest.rejectedAt;
  const formation = await prisma.formation.create({
    data: {
      ...rest,
      createdById: req.user.id,
      isPublished: canPublishProgramming(req.user.role) && Boolean(req.body.isPublished),
      modules: modules ? { create: buildModulesCreateInput(modules) } : undefined,
    },
    include: { modules: { include: { lessons: true } } },
  });
  res.status(201).json(apiResponse(true, formation, "Formation created"));
});

export const updateFormation = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const existing = await prisma.formation.findUnique({
    where: { id: req.params.id },
    select: { createdById: true },
  });
  if (!existing) throw new ApiError(404, "Formation not found");
  if (existing.createdById !== req.user.id && !canPublishProgramming(req.user.role)) {
    throw new ApiError(403, "Forbidden");
  }

  const modules = req.body.modules as ModuleInput[] | undefined;
  const rest = { ...req.body };
  delete rest.modules;
  delete rest.createdById;
  delete rest.isPublished;
  delete rest.rejectedAt;
  const isPublished: boolean | undefined =
    req.body.isPublished === undefined ? undefined : canPublishProgramming(req.user.role) ? Boolean(req.body.isPublished) : false;

  const formation = await prisma.$transaction(async (tx) => {
    if (modules) {
      await tx.formationModule.deleteMany({ where: { formationId: req.params.id } });
    }
    return tx.formation.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        isPublished,
        rejectedAt: isPublished === undefined ? undefined : null,
        modules: modules ? { create: buildModulesCreateInput(modules) } : undefined,
      },
      include: { modules: { include: { lessons: true } } },
    });
  });

  res.json(apiResponse(true, formation, "Formation updated"));
});

export const downloadFormation = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");

  const existing = await prisma.formation.findUnique({
    where: { id: req.params.id },
    select: { id: true, price: true, createdById: true },
  });
  if (!existing) throw new ApiError(404, "Formation not found");

  const isOwner = existing.createdById === req.user.id;
  const isFree = existing.price.lte(0);
  const isStaff = req.user.role === "SUPER_ADMIN" || req.user.role === "ADMIN";
  if (!isOwner && !isFree && !isStaff) {
    const enrollment = await prisma.formationEnrollment.findUnique({
      where: { formationId_userId: { formationId: existing.id, userId: req.user.id } },
    });
    if (!enrollment) throw new ApiError(403, "Vous devez etre inscrit a cette formation pour la telecharger");
  }

  const formation = await prisma.formation.update({
    where: { id: req.params.id },
    data: { downloadCount: { increment: 1 } },
    select: { id: true, fileUrl: true, downloadCount: true },
  });
  res.json(
    apiResponse(true, { ...formation, signedUrl: formation.fileUrl }, "Formation download ready"),
  );
});

export const listMyFormationEnrollments = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const enrollments = await prisma.formationEnrollment.findMany({
    where: { userId: req.user.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      formation: {
        include: {
          modules: { include: { lessons: { select: { id: true } } } },
          createdBy: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  const enrollmentsWithProgress = enrollments.map(({ formation, ...enrollment }) => {
    const lessonCount = formation.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    const progressPercent = lessonCount > 0 ? Math.round((enrollment.completedLessonIds.length / lessonCount) * 100) : 0;
    const { modules: _modules, ...formationSummary } = formation;
    return { ...enrollment, formation: formationSummary, lessonCount, progressPercent };
  });

  res.json(apiResponse(true, enrollmentsWithProgress, "My formation enrollments retrieved"));
});

export const getMyFormationEnrollment = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const enrollment = await prisma.formationEnrollment.findUnique({
    where: { formationId_userId: { formationId: req.params.id, userId: req.user.id } },
  });
  res.json(apiResponse(true, enrollment, "Enrollment status retrieved"));
});

export const enrollFormation = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const formation = await prisma.formation.findUnique({
    where: { id: req.params.id },
    select: { id: true, price: true, currency: true, createdById: true, title: true },
  });
  if (!formation) throw new ApiError(404, "Formation not found");
  if (formation.createdById === req.user.id) throw new ApiError(400, "Vous ne pouvez pas vous inscrire a votre propre formation");

  const existing = await prisma.formationEnrollment.findUnique({
    where: { formationId_userId: { formationId: formation.id, userId: req.user.id } },
  });
  if (existing) throw new ApiError(409, "Vous etes deja inscrit a cette formation");

  if (formation.price.lte(0)) {
    const enrollment = await prisma.formationEnrollment.create({
      data: { formationId: formation.id, userId: req.user.id, pricePaid: 0, paymentMethod: "free" },
    });
    res.status(201).json(apiResponse(true, { enrollment, checkoutUrl: null }, "Inscription confirmee"));
    return;
  }

  if (req.body.method === "wallet") {
    const enrollment = await prisma.$transaction(async (tx) => {
      // Same conditional-atomic-decrement pattern as order/wallet payments
      // (payment.controller.ts) — the WHERE clause is evaluated atomically
      // by Postgres, so two concurrent purchases can't both pass a stale
      // balance check.
      const decremented = await tx.user.updateMany({
        where: { id: req.user!.id, walletBalance: { gte: formation.price } },
        data: { walletBalance: { decrement: formation.price } },
      });
      if (decremented.count === 0) throw new ApiError(400, "Solde du portefeuille insuffisant");

      const buyer = await tx.user.findUnique({ where: { id: req.user!.id }, select: { walletBalance: true } });
      const buyerBalanceAfter = buyer?.walletBalance ?? new Prisma.Decimal(0);

      const createdEnrollment = await tx.formationEnrollment.create({
        data: {
          formationId: formation.id,
          userId: req.user!.id,
          pricePaid: formation.price,
          paymentMethod: "wallet",
        },
      });

      const reference = `formation:${formation.id}:${createdEnrollment.id}`;
      await tx.walletTransaction.create({
        data: {
          userId: req.user!.id,
          amount: formation.price.neg(),
          type: "TRANSFER",
          reference: `${reference}:buyer`,
          description: `Achat formation "${formation.title}"`,
          balanceBefore: buyerBalanceAfter.plus(formation.price),
          balanceAfter: buyerBalanceAfter,
        },
      });

      // Formations have no MLM/affiliate downline the way marketplace
      // products do — the full price goes to the course creator, no
      // platform commission taken in this first version.
      const creator = await tx.user.update({
        where: { id: formation.createdById },
        data: { walletBalance: { increment: formation.price } },
        select: { walletBalance: true },
      });
      await tx.walletTransaction.create({
        data: {
          userId: formation.createdById,
          amount: formation.price,
          type: "TRANSFER",
          reference: `${reference}:creator`,
          description: `Vente formation "${formation.title}"`,
          balanceBefore: creator.walletBalance.minus(formation.price),
          balanceAfter: creator.walletBalance,
        },
      });

      return createdEnrollment;
    }, { timeout: 20000, maxWait: 10000 });

    res.status(201).json(apiResponse(true, { enrollment, checkoutUrl: null }, "Inscription et paiement confirmes"));
    return;
  }

  const reference = `formation_${formation.id}_${req.user.id}_${Date.now()}`;
  const payment = await initiateMonerooPayment({
    amount: formation.price.toString(),
    currency: formation.currency,
    description: `Iwosan formation: ${formation.title}`,
    customerEmail: req.user.email,
    reference,
    metadata: { type: "formation_purchase", formationId: formation.id, userId: req.user.id },
  });

  res.json(apiResponse(true, payment, "Payment initialized"));
});

export const updateFormationProgress = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const lessonId = String(req.body.lessonId ?? "");
  if (!lessonId) throw new ApiError(400, "lessonId is required");
  const completed = Boolean(req.body.completed);

  const enrollment = await prisma.formationEnrollment.findUnique({
    where: { formationId_userId: { formationId: req.params.id, userId: req.user.id } },
  });
  if (!enrollment) throw new ApiError(403, "Vous devez etre inscrit a cette formation");

  const nextLessonIds = completed
    ? Array.from(new Set([...enrollment.completedLessonIds, lessonId]))
    : enrollment.completedLessonIds.filter((id) => id !== lessonId);

  const updated = await prisma.formationEnrollment.update({
    where: { id: enrollment.id },
    data: { completedLessonIds: nextLessonIds },
  });

  res.json(apiResponse(true, updated, "Progression mise a jour"));
});

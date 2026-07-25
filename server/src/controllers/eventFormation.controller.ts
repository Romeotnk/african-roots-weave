import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

const canPublishProgramming = (role: Role) => role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.EDITOR;

export const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isPublished: true, type: req.query.type as never };
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
    prisma.event.findMany({ where, skip, take: limit, orderBy: { startDate: "asc" } }),
    prisma.event.count({ where }),
  ]);

  res.json(apiResponse(true, events, "My events retrieved", paginationMeta(page, limit, total)));
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { registrations: true },
  });
  if (!event) throw new ApiError(404, "Event not found");
  res.json(apiResponse(true, event, "Event retrieved"));
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
    prisma.formation.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.formation.count({ where }),
  ]);

  res.json(
    apiResponse(true, formations, "My formations retrieved", paginationMeta(page, limit, total)),
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
          professionalProfile: { select: { id: true, displayName: true, photos: true } },
        },
      },
    },
  });
  if (!formation) throw new ApiError(404, "Formation not found");

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
      { ...formation, reviews, rating: reviewAgg._avg.rating ?? 0, reviewCount: reviewAgg._count.id },
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
        modules: modules ? { create: buildModulesCreateInput(modules) } : undefined,
      },
      include: { modules: { include: { lessons: true } } },
    });
  });

  res.json(apiResponse(true, formation, "Formation updated"));
});

export const downloadFormation = asyncHandler(async (req, res) => {
  const formation = await prisma.formation.update({
    where: { id: req.params.id },
    data: { downloadCount: { increment: 1 } },
    select: { id: true, fileUrl: true, downloadCount: true },
  });
  res.json(
    apiResponse(true, { ...formation, signedUrl: formation.fileUrl }, "Formation download ready"),
  );
});

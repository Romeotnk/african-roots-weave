import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";
import { getPagination, paginationMeta } from "../utils/pagination.js";

export const listEvents = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isPublished: true, type: req.query.type as never };
  const [events, total] = await prisma.$transaction([
    prisma.event.findMany({ where, skip, take: limit, orderBy: { startDate: "asc" } }),
    prisma.event.count({ where }),
  ]);
  res.json(apiResponse(true, events, "Events retrieved", paginationMeta(page, limit, total)));
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
      isPublished: req.user.role === Role.ADMIN ? Boolean(req.body.isPublished) : false,
    },
  });
  res.status(201).json(apiResponse(true, event, "Event created"));
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
  };
  const [formations, total] = await prisma.$transaction([
    prisma.formation.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.formation.count({ where }),
  ]);
  res.json(
    apiResponse(true, formations, "Formations retrieved", paginationMeta(page, limit, total)),
  );
});

export const getFormation = asyncHandler(async (req, res) => {
  const formation = await prisma.formation.findUnique({ where: { id: req.params.id } });
  if (!formation) throw new ApiError(404, "Formation not found");
  res.json(apiResponse(true, formation, "Formation retrieved"));
});

export const createFormation = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const formation = await prisma.formation.create({
    data: { ...req.body, createdById: req.user.id },
  });
  res.status(201).json(apiResponse(true, formation, "Formation created"));
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

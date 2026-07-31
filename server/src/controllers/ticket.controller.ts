import { prisma } from "../config/db.js";
import { uploadBufferToCloudinary } from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

export const listMyTickets = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const tickets = await prisma.ticket.findMany({
    where: { authorId: req.user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(apiResponse(true, tickets, "Tickets retrieved"));
});

export const getMyTicket = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } } },
    },
  });
  if (!ticket || ticket.authorId !== req.user.id) throw new ApiError(404, "Ticket not found");
  res.json(apiResponse(true, ticket, "Ticket retrieved"));
});

export const createTicket = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const subject = String(req.body.subject ?? "").trim();
  const category = String(req.body.category ?? "General").trim();
  let content = String(req.body.content ?? "").trim();
  if (!subject) throw new ApiError(400, "Subject is required");
  if (!content) throw new ApiError(400, "Message content is required");

  const attachments = Array.isArray(req.body.attachments)
    ? (req.body.attachments as unknown[]).filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];
  if (attachments.length > 0) {
    content += `\n\nPièces jointes :\n${attachments.map((url) => `- ${url}`).join("\n")}`;
  }

  const ticket = await prisma.ticket.create({
    data: {
      authorId: req.user.id,
      subject,
      category,
      messages: { create: { authorId: req.user.id, content } },
    },
    include: { messages: true },
  });
  res.status(201).json(apiResponse(true, ticket, "Ticket created"));
});

export const uploadTicketAttachments = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new ApiError(400, "Aucun fichier fourni");

  const urls = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, "iwosan/ticket-attachments", "auto")),
  );
  res.json(apiResponse(true, { urls }, "Attachments uploaded"));
});

export const replyMyTicket = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Authentication required");
  const content = String(req.body.content ?? "").trim();
  if (!content) throw new ApiError(400, "Message content is required");

  const ticket = await prisma.ticket.findUnique({ where: { id: req.params.id }, select: { authorId: true, status: true } });
  if (!ticket || ticket.authorId !== req.user.id) throw new ApiError(404, "Ticket not found");

  const message = await prisma.ticketMessage.create({
    data: { ticketId: req.params.id, authorId: req.user.id, content },
  });
  if (ticket.status === "RESOLVED") {
    await prisma.ticket.update({ where: { id: req.params.id }, data: { status: "OPEN" } });
  }
  res.status(201).json(apiResponse(true, message, "Reply sent"));
});

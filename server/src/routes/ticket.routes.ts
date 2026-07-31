import { Router } from "express";
import { listTickets, replyTicket, updateTicketStatus } from "../controllers/admin.controller.js";
import { createTicket, getMyTicket, listMyTickets, replyMyTicket, uploadTicketAttachments } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { checkPermission } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

export const ticketRouter = Router();

// Staff who can help answer support tickets without full admin-panel access.
// Gated on the "support.triage" permission (see utils/permissions.ts) rather
// than a hardcoded role list, so an admin can grant/revoke ticket-triage
// access per user (e.g. one specific PROFESSIONAL) without touching this file.
ticketRouter.use(authMiddleware);
ticketRouter.get("/", listMyTickets);
ticketRouter.get("/staff/all", checkPermission("support.triage"), listTickets);
ticketRouter.put("/staff/:id/status", checkPermission("support.triage"), updateTicketStatus);
ticketRouter.post("/staff/:id/reply", checkPermission("support.triage"), replyTicket);
ticketRouter.get("/:id", getMyTicket);
ticketRouter.post("/", createTicket);
ticketRouter.post("/:id/reply", replyMyTicket);
ticketRouter.post("/attachments", upload.array("files", 5), uploadTicketAttachments);

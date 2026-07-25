import { Router } from "express";
import { createTicket, getMyTicket, listMyTickets, replyMyTicket } from "../controllers/ticket.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const ticketRouter = Router();

ticketRouter.use(authMiddleware);
ticketRouter.get("/", listMyTickets);
ticketRouter.get("/:id", getMyTicket);
ticketRouter.post("/", createTicket);
ticketRouter.post("/:id/reply", replyMyTicket);

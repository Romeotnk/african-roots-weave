import { Router } from "express";
import { listConversations, markConversationRead } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const messageRouter = Router();

messageRouter.use(authMiddleware);
messageRouter.get("/conversations", listConversations);
messageRouter.put("/conversations/:participantId/read", markConversationRead);

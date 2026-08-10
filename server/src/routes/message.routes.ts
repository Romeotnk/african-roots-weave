import { Router } from "express";
import { listConversations, markConversationRead, uploadMessageAttachments } from "../controllers/message.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

export const messageRouter = Router();

messageRouter.use(authMiddleware);
messageRouter.get("/conversations", listConversations);
messageRouter.put("/conversations/:participantId/read", markConversationRead);
messageRouter.post("/attachments", upload.array("files", 5), uploadMessageAttachments);

import { Role } from "@prisma/client";
import { prisma } from "../config/db.js";
import { writeAuditLog } from "../services/audit.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/errors.js";

const audienceWhere = (audience: string) => {
  if (audience === "all") return {};
  if (audience === "professionals") return { role: Role.PROFESSIONAL };
  if (audience === "users") return { role: Role.USER };
  if (audience === "researchers") return { role: Role.RESEARCHER };
  throw new ApiError(400, `Unsupported audience: ${audience}`);
};

export const broadcastNotification = asyncHandler(async (req, res) => {
  const { audience, title, message, link } = req.body as {
    audience: string;
    title: string;
    message: string;
    link?: string;
  };
  if (!title?.trim() || !message?.trim()) throw new ApiError(400, "Title and message are required");

  const recipients = await prisma.user.findMany({
    where: { ...audienceWhere(audience), isBanned: false },
    select: { id: true },
  });

  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.id,
        type: "ADMIN_BROADCAST",
        title: title.trim(),
        message: message.trim(),
        link: link?.trim() || undefined,
      })),
    });
  }

  await writeAuditLog(req, {
    action: "NOTIFICATION_BROADCAST",
    metadata: { audience, title, recipientCount: recipients.length },
  });

  res.status(201).json(apiResponse(true, { recipientCount: recipients.length }, "Notification broadcast sent"));
});

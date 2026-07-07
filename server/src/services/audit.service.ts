import type { Request } from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";

type AuditInput = {
  action: string;
  targetId?: string;
  targetType?: string;
  metadata?: Prisma.InputJsonValue;
};

export const writeAuditLog = async (req: Request, input: AuditInput) => {
  await prisma.auditLog.create({
    data: {
      userId: req.user?.id,
      action: input.action,
      targetId: input.targetId,
      targetType: input.targetType,
      metadata: input.metadata,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    },
  });
};

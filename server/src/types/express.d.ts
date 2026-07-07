import type { AdminSubRole, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        adminSubRole?: AdminSubRole | null;
        isResearcher: boolean;
        email: string;
        language: string;
        kycStatus: string;
        isEmailVerified: boolean;
      };
      language?: string;
    }
  }
}

export {};

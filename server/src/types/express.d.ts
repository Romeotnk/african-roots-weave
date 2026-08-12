import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
        language: string;
        kycStatus: string;
        isEmailVerified: boolean;
      };
      // Captured verbatim by the express.json() verify hook in app.ts so
      // webhook signature checks (Moneroo) can HMAC the exact bytes the
      // provider signed, instead of a re-serialized JSON.stringify(req.body)
      // that can diverge on key order/number formatting/whitespace.
      rawBody?: Buffer;
    }
  }
}

export {};

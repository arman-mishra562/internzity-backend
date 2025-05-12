import { User, Instructor } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      
      user?: User & { instructor?: Instructor };
      instructorId?: string;
    }
  }
}

export {};
import { User } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: User & {
        role: string;
        permissions: string[];
        institutionId: string;
        userId: string;
      };
    }
  }
}
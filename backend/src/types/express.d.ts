import { Request } from 'express';
import { User } from '../../../src/types/user';

declare global {
  namespace Express {
    interface Request {
      authenticated?: boolean;
      userId?: string;
      user?: User;
      sessionId?: string;
      activityStartTime?: number;
      activityData?: any;
    }
  }
}

// Garantir que este arquivo seja tratado como um módulo
export {};

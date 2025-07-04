import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  authenticated?: boolean;
  userId?: string;
}

import { JwtPayload } from 'jsonwebtoken';

interface JWTPayload extends JwtPayload {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  institutionId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export { JWTPayload };
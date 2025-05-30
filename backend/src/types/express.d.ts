interface AuthTokenPayload {
  userId: string;
  email?: string;
  name?: string;
  role: string;
  permissions?: string[];
  institutionId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export { AuthTokenPayload };
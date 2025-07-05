interface AuthTokenPayload {
  userId: string;
  email?: string;
  role?: string;
  institutionId?: string;
  sessionId?: string;
  permissions?: string[];
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export { AuthTokenPayload };
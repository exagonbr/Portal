// Definição do payload do token que é usado em toda a aplicação
export interface AuthTokenPayload {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
  permissions?: string[];
  institutionId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      // Usa o AuthTokenPayload para tipar o usuário na requisição
      user?: AuthTokenPayload;
    }
  }
}
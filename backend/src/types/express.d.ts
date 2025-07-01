import { AuthenticatedUser } from './auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
    
    // Sobrescreve a definição do Passport para usar nosso tipo
    interface User extends AuthenticatedUser {}
  }
}

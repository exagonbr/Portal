import { AuthTokenPayload as CustomAuthTokenPayload } from './auth.types';

declare global {
  namespace Express {
    // Sobrescreve a interface User do Passport.js
    interface User extends CustomAuthTokenPayload {}

    interface Request {
      // Agora o req.user será do tipo User (que é o nosso AuthTokenPayload)
      user?: User;
    }
  }
}
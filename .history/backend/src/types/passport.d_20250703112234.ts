import { AccessTokenPayload } from '../config/jwt';

declare global {
  namespace Express {
    // Estende a interface User do Passport
    interface User extends AccessTokenPayload {}
  }
}

export {}; 
import { AccessTokenPayload } from '../config/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload;
  }
}

export {};

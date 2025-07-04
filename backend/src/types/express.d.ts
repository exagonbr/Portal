import { User as UserModel } from '../entities/User';

declare global {
  namespace Express {
    interface User extends UserModel {
      // Adicione aqui outras propriedades que você pode querer no objeto User do Express
    }

    interface Request {
      user?: User;
      authenticated?: boolean;
      userId?: string;
    }
  }
}

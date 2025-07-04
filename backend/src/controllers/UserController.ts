import { BaseController } from './BaseController';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';

const userRepository = new UserRepository();

class UserController extends BaseController<User> {
  constructor() {
    super(userRepository);
  }

  // Aqui você pode adicionar métodos específicos para o UserController, se necessário.
  // Por exemplo, um método para buscar usuários por role ou instituição.
}

export default new UserController();
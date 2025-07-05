import { Request, Response } from 'express';
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

  public async login(req: Request, res: Response): Promise<Response> {
    return res.json({ message: 'login', data: req.body });
  }

  public async toggleStatus(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `toggle status for user ${id}`, data: req.body });
  }

  public async changePassword(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `change password for user ${id}`, data: req.body });
  }

  public async getProfile(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    return res.json({ message: `get profile for user ${id}` });
  }
}

export default new UserController();
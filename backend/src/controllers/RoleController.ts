import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Role } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';

class RoleController extends BaseController<Role> {
  private roleRepository: RoleRepository;

  constructor() {
    const repository = new RoleRepository();
    super(repository);
    this.roleRepository = repository;
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await this.roleRepository.toggleStatus(id);
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
      return res.status(200).json({ success: true, data: role });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new RoleController();

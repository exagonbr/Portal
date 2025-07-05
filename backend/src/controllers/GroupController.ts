import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { UserGroup, GroupMember, GroupPermission } from '../repositories/GroupRepository'; // Usando as interfaces do repositório
import { GroupRepository } from '../repositories/GroupRepository';

const groupRepository = new GroupRepository();

class GroupController extends BaseController<UserGroup> {
  constructor() {
    super(groupRepository);
  }

  // Métodos para Membros
  public async getMembers(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const members = await groupRepository.getMembers(id);
      return res.status(200).json({ success: true, data: members });
    } catch (error) {
      console.error(`Error in getMembers: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async addMember(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { userId, role } = req.body;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }
      await groupRepository.addMember(id, userId, role);
      return res.status(200).json({ success: true, message: 'Member added successfully' });
    } catch (error) {
      console.error(`Error in addMember: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async removeMember(req: Request, res: Response): Promise<Response> {
    try {
      const { id, userId } = req.params;
      await groupRepository.removeMember(id, userId);
      return res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
      console.error(`Error in removeMember: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  // Métodos para Permissões
  public async getPermissions(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const permissions = await groupRepository.getPermissions(id);
      return res.status(200).json({ success: true, data: permissions });
    } catch (error) {
      console.error(`Error in getPermissions: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }

  public async setPermission(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { permissionKey, allowed } = req.body;
      if (!permissionKey || allowed === undefined) {
        return res.status(400).json({ success: false, message: 'permissionKey and allowed are required' });
      }
      await groupRepository.setPermission(id, permissionKey, allowed);
      return res.status(200).json({ success: true, message: 'Permission set successfully' });
    } catch (error) {
      console.error(`Error in setPermission: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new GroupController();
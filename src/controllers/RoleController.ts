import { Request, Response } from 'express';
import { Role } from '../models/Role';

class RoleController {
  async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await Role.query();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar funções', error });
    }
  }

  async getRoleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await Role.query().findById(id);
      
      if (!role) {
        return res.status(404).json({ message: 'Função não encontrada' });
      }
      
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar função', error });
    }
  }

  async createRole(req: Request, res: Response) {
    try {
      const { authority, displayName } = req.body;
      
      if (!authority || !displayName) {
        return res.status(400).json({ message: 'Authority e displayName são obrigatórios' });
      }
      
      const newRole = await Role.query().insert({
        authority,
        displayName
      });
      
      res.status(201).json(newRole);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao criar função', error });
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { authority, displayName } = req.body;
      
      const updatedRole = await Role.query().patchAndFetchById(id, {
        authority,
        displayName
      });
      
      if (!updatedRole) {
        return res.status(404).json({ message: 'Função não encontrada' });
      }
      
      res.status(200).json(updatedRole);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar função', error });
    }
  }

  async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await Role.query().deleteById(id);
      
      if (!deleted) {
        return res.status(404).json({ message: 'Função não encontrada' });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Erro ao excluir função', error });
    }
  }

  async getRoleWithUsers(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const role = await Role.query()
        .findById(id)
        .withGraphFetched('users');
      
      if (!role) {
        return res.status(404).json({ message: 'Função não encontrada' });
      }
      
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar função com usuários', error });
    }
  }
}

export default new RoleController();
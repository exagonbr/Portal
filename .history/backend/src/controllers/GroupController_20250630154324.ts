import { Request, Response } from 'express';
import { GroupService } from '../services/GroupService';
import { CreateUserGroupData, UpdateUserGroupData } from '../models/UserGroup';
import { RolePermissions } from '../types/roles';

export class GroupController {
  constructor(private groupService: GroupService) {}

  // GET /api/groups
  async getGroups(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        institution_id: req.query.institution_id as string,
        school_id: req.query.school_id as string,
        is_active: req.query.is_active ? req.query.is_active === 'true' : undefined,
        search: req.query.search as string
      };

      const groups = await this.groupService.getGroups(filters);
      
      res.json({
        success: true,
        data: groups,
        total: groups.length
      });
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // GET /api/groups/:id
  async getGroupById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const group = await this.groupService.getGroupById(id);
      
      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Grupo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: group
      });
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/groups
  async createGroup(req: Request, res: Response): Promise<void> {
    try {
      const groupData: CreateUserGroupData = req.body;
      const group = await this.groupService.createGroup(groupData);
      
      res.status(201).json({
        success: true,
        data: group,
        message: 'Grupo criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar grupo'
      });
    }
  }

  // PUT /api/groups/:id
  async updateGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateUserGroupData = req.body;
      
      const group = await this.groupService.updateGroup(id, updateData);
      
      if (!group) {
        res.status(404).json({
          success: false,
          error: 'Grupo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: group,
        message: 'Grupo atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao atualizar grupo'
      });
    }
  }

  // DELETE /api/groups/:id
  async deleteGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await this.groupService.deleteGroup(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Grupo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Grupo excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao excluir grupo'
      });
    }
  }

  // GET /api/groups/:id/members
  async getGroupMembers(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const members = await this.groupService.getGroupMembers(id);
      
      res.json({
        success: true,
        data: members,
        total: members.length
      });
    } catch (error) {
      console.error('Erro ao buscar membros do grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/groups/:id/members
  async addGroupMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId } = req.params;
      const { user_id, role = 'member' } = req.body;
      const addedBy = (req.user as any)?.userId || 'system'; // Pegar do middleware de auth
      
      const member = await this.groupService.addMemberToGroup(groupId, user_id, addedBy, role);
      
      res.status(201).json({
        success: true,
        data: member,
        message: 'Membro adicionado ao grupo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao adicionar membro ao grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar membro'
      });
    }
  }

  // DELETE /api/groups/:id/members/:userId
  async removeGroupMember(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId, userId } = req.params;
      const removed = await this.groupService.removeMemberFromGroup(groupId, userId);
      
      if (!removed) {
        res.status(404).json({
          success: false,
          error: 'Membro não encontrado no grupo'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Membro removido do grupo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover membro do grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover membro'
      });
    }
  }

  // POST /api/groups/:id/members/bulk
  async bulkAddMembers(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId } = req.params;
      const { user_ids } = req.body;
      const addedBy = (req.user as any)?.userId || 'system';
      
      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Lista de IDs de usuários é obrigatória'
        });
        return;
      }

      const members = await this.groupService.bulkAddMembers(groupId, user_ids, addedBy);
      
      res.status(201).json({
        success: true,
        data: members,
        message: `${members.length} membros adicionados ao grupo`
      });
    } catch (error) {
      console.error('Erro ao adicionar membros em lote:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao adicionar membros'
      });
    }
  }

  // GET /api/groups/:id/permissions
  async getGroupPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const permissions = await this.groupService.getGroupPermissions(id);
      
      res.json({
        success: true,
        data: permissions,
        total: permissions.length
      });
    } catch (error) {
      console.error('Erro ao buscar permissões do grupo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // PUT /api/groups/:id/permissions
  async setGroupPermission(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId } = req.params;
      const { permission_key, allowed, context_type = 'global', context_id } = req.body;
      
      // Validar se permission_key é uma chave válida de RolePermissions
      if (!permission_key || typeof permission_key !== 'string') {
        res.status(400).json({
          success: false,
          error: 'permission_key é obrigatório'
        });
        return;
      }
      
      const permission = await this.groupService.setGroupPermission(
        groupId,
        permission_key as keyof RolePermissions,
        allowed,
        context_type as 'global' | 'institution' | 'school',
        context_id
      );
      
      res.json({
        success: true,
        data: permission,
        message: 'Permissão do grupo definida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao definir permissão do grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao definir permissão'
      });
    }
  }

  // DELETE /api/groups/:id/permissions
  async removeGroupPermission(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId } = req.params;
      const { permission_key, context_type = 'global', context_id } = req.query;
      
      // Validar se permission_key é uma chave válida de RolePermissions
      if (!permission_key || typeof permission_key !== 'string') {
        res.status(400).json({
          success: false,
          error: 'permission_key é obrigatório'
        });
        return;
      }
      
      const removed = await this.groupService.removeGroupPermission(
        groupId,
        permission_key as keyof RolePermissions,
        context_type as 'global' | 'institution' | 'school',
        context_id as string
      );
      
      if (!removed) {
        res.status(404).json({
          success: false,
          error: 'Permissão não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Permissão removida do grupo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao remover permissão do grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao remover permissão'
      });
    }
  }

  // POST /api/groups/:id/permissions/bulk
  async bulkSetGroupPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id: groupId } = req.params;
      const { permissions } = req.body;
      
      if (!Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: 'Lista de permissões é obrigatória'
        });
        return;
      }

      const results = await this.groupService.bulkSetGroupPermissions(groupId, permissions);
      
      res.json({
        success: true,
        data: results,
        message: `${results.length} permissões definidas para o grupo`
      });
    } catch (error) {
      console.error('Erro ao definir permissões em lote:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao definir permissões'
      });
    }
  }

  // GET /api/groups/stats
  async getGroupStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.groupService.getGroupStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos grupos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // POST /api/groups/:id/clone
  async cloneGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id: sourceGroupId } = req.params;
      const { name, institution_id, school_id } = req.body;
      
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Nome do novo grupo é obrigatório'
        });
        return;
      }

      const clonedGroup = await this.groupService.cloneGroup(
        sourceGroupId, 
        name, 
        institution_id, 
        school_id
      );
      
      res.status(201).json({
        success: true,
        data: clonedGroup,
        message: 'Grupo clonado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao clonar grupo:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao clonar grupo'
      });
    }
  }

  // GET /api/users/:userId/permissions/effective
  async getUserEffectivePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { context_type = 'global', context_id } = req.query;
      
      const permissions = await this.groupService.calculateUserEffectivePermissions(
        userId, 
        context_type as any, 
        context_id as string
      );
      
      res.json({
        success: true,
        data: permissions
      });
    } catch (error) {
      console.error('Erro ao calcular permissões efetivas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  // PUT /api/users/:userId/permissions/contextual
  async setUserContextualPermission(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { permission_key, allowed, context_type = 'global', context_id } = req.body;
      
      // Validar se permission_key é uma chave válida de RolePermissions
      if (!permission_key || typeof permission_key !== 'string') {
        res.status(400).json({
          success: false,
          error: 'permission_key é obrigatório'
        });
        return;
      }
      
      const permission = await this.groupService.setUserContextualPermission(
        userId,
        permission_key as keyof RolePermissions,
        allowed,
        context_type as 'global' | 'institution' | 'school',
        context_id,
        'direct'
      );
      
      res.json({
        success: true,
        data: permission,
        message: 'Permissão contextual definida com sucesso'
      });
    } catch (error) {
      console.error('Erro ao definir permissão contextual:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao definir permissão'
      });
    }
  }
}

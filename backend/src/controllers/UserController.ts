import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // Listar todos os usuários
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, search, role, institutionId, schoolId } = req.query;
      
      const users = await this.userService.getAllUsers({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        role: role as string,
        institutionId: institutionId as string,
        schoolId: schoolId as string
      });

      res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  };

  // Buscar usuário por ID
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  };

  // Atualizar usuário
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const currentUser = req.user;

      // Verificar se é o próprio usuário ou admin
      if (currentUser?.userId !== id && currentUser?.role !== 'admin') {
        res.status(403).json({ error: 'Sem permissão para atualizar este usuário' });
        return;
      }

      const updatedUser = await this.userService.updateUser(id, updateData);

      if (!updatedUser) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  };

  // Deletar usuário
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const success = await this.userService.deleteUser(id);

      if (!success) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  };

  // Listar usuários por instituição
  getUsersByInstitution = async (req: Request, res: Response): Promise<void> => {
    try {
      const { institutionId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const users = await this.userService.getUsersByInstitution(
        institutionId,
        Number(page),
        Number(limit)
      );

      res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários por instituição:', error);
      res.status(500).json({ error: 'Erro ao listar usuários por instituição' });
    }
  };

  // Listar usuários por escola
  getUsersBySchool = async (req: Request, res: Response): Promise<void> => {
    try {
      const { schoolId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const users = await this.userService.getUsersBySchool(
        schoolId,
        Number(page),
        Number(limit)
      );

      res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários por escola:', error);
      res.status(500).json({ error: 'Erro ao listar usuários por escola' });
    }
  };

  // Listar usuários por turma
  getUsersByClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { classId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const users = await this.userService.getUsersByClass(
        classId,
        Number(page),
        Number(limit)
      );

      res.json(users);
    } catch (error) {
      console.error('Erro ao listar usuários por turma:', error);
      res.status(500).json({ error: 'Erro ao listar usuários por turma' });
    }
  };

  // Atribuir papel a usuário
  assignRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        res.status(400).json({ error: 'ID do papel é obrigatório' });
        return;
      }

      const updatedUser = await this.userService.assignRole(id, roleId);

      if (!updatedUser) {
        res.status(404).json({ error: 'Usuário ou papel não encontrado' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao atribuir papel:', error);
      res.status(500).json({ error: 'Erro ao atribuir papel ao usuário' });
    }
  };

  // Adicionar usuário a turma
  addToClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, classId } = req.params;

      const success = await this.userService.addToClass(id, classId);

      if (!success) {
        res.status(404).json({ error: 'Usuário ou turma não encontrada' });
        return;
      }

      res.json({ message: 'Usuário adicionado à turma com sucesso' });
    } catch (error) {
      console.error('Erro ao adicionar usuário à turma:', error);
      res.status(500).json({ error: 'Erro ao adicionar usuário à turma' });
    }
  };

  // Remover usuário de turma
  removeFromClass = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, classId } = req.params;

      const success = await this.userService.removeFromClass(id, classId);

      if (!success) {
        res.status(404).json({ error: 'Usuário ou turma não encontrada' });
        return;
      }

      res.json({ message: 'Usuário removido da turma com sucesso' });
    } catch (error) {
      console.error('Erro ao remover usuário da turma:', error);
      res.status(500).json({ error: 'Erro ao remover usuário da turma' });
    }
  };

  // Ativar/desativar usuário
  toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        res.status(400).json({ error: 'Status isActive deve ser um booleano' });
        return;
      }

      const updatedUser = await this.userService.toggleUserStatus(id, isActive);

      if (!updatedUser) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      res.status(500).json({ error: 'Erro ao alterar status do usuário' });
    }
  };
}

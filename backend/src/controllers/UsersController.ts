import { Request, Response } from 'express';
import { UsersService } from '../services/UsersService';
import { CreateUsersData, UpdateUsersData } from '../models/Users';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  // GET /users
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getAllUsers();
      res.json({
        success: true,
        data: users,
        message: 'Usuários recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/:id
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const user = await this.usersService.getUserById(id.toString());
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON(), // Remove senha do retorno
        message: 'Usuário recuperado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/email/:email
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const email = req.params.email;
      const user = await this.usersService.getUserByEmail(email);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON(),
        message: 'Usuário recuperado com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/role/:roleId
  async getUsersByRole(req: Request, res: Response): Promise<void> {
    try {
      const roleId = req.params.roleId;
      const users = await this.usersService.getUsersByRole(roleId);
      
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Usuários recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/institution/:institutionId
  async getUsersByInstitution(req: Request, res: Response): Promise<void> {
    try {
      const institutionId = parseInt(req.params.institutionId);
      if (isNaN(institutionId)) {
        res.status(400).json({
          success: false,
          message: 'ID da instituição inválido'
        });
        return;
      }

      const users = await this.usersService.getUsersByInstitution(institutionId.toString());
      
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Usuários recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/admins
  async getAdmins(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getAdmins();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Administradores recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar administradores',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/teachers
  async getTeachers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getTeachers();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Professores recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar professores',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/students
  async getStudents(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getStudents();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Estudantes recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar estudantes',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/guardians
  async getGuardians(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getGuardians();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Responsáveis recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar responsáveis',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/coordinators
  async getCoordinators(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getCoordinators();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Coordenadores recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar coordenadores',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/type/managers
  async getInstitutionManagers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.usersService.getInstitutionManagers();
      res.json({
        success: true,
        data: users.map(user => user.toJSON()),
        message: 'Gerentes de instituição recuperados com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar gerentes de instituição',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // POST /users
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: CreateUsersData = req.body;
      
      // Validações básicas
      if (!userData.email || !userData.fullName) {
        res.status(400).json({
          success: false,
          message: 'Email e nome completo são obrigatórios'
        });
        return;
      }

      const user = await this.usersService.createUser(userData);
      
      res.status(201).json({
        success: true,
        data: user.toJSON(),
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PUT /users/:id
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const userData: UpdateUsersData = req.body;
      const user = await this.usersService.updateUser(id.toString(), userData);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON(),
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // DELETE /users/:id
  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const deleted = await this.usersService.deleteUser(id.toString());
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao deletar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/soft-delete
  async softDeleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.softDeleteUser(id.toString());
      
      res.json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao desativar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/activate
  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.activateUser(id.toString());
      
      res.json({
        success: true,
        message: 'Usuário ativado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao ativar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/deactivate
  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.deactivateUser(id.toString());
      
      res.json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao desativar usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/reset-password
  async resetUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.resetUserPassword(id.toString());
      
      res.json({
        success: true,
        message: 'Senha do usuário resetada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao resetar senha do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/change-password
  async changeUserPassword(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias'
        });
        return;
      }

      await this.usersService.changeUserPassword(id.toString(), currentPassword, newPassword);
      
      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao alterar senha',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/lock
  async lockUserAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.lockUserAccount(id.toString());
      
      res.json({
        success: true,
        message: 'Conta do usuário bloqueada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao bloquear conta do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // PATCH /users/:id/unlock
  async unlockUserAccount(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
        return;
      }

      await this.usersService.unlockUserAccount(id.toString());
      
      res.json({
        success: true,
        message: 'Conta do usuário desbloqueada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao desbloquear conta do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // GET /users/stats
  async getUserStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.usersService.getUserStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas de usuários recuperadas com sucesso'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao recuperar estatísticas de usuários',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  // POST /users/authenticate
  async authenticateUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
        return;
      }

      const user = await this.usersService.authenticateUser(email, password);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
        return;
      }

      res.json({
        success: true,
        data: user.toJSON(),
        message: 'Usuário autenticado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro na autenticação',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}
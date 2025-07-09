import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Role } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';
import { AppDataSource } from '../config/typeorm.config';

class RoleController extends BaseController<Role> {
  private _roleRepository: RoleRepository | null = null;

  constructor() {
    let repository;
    try {
      repository = new RoleRepository();
      console.log('RoleRepository inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar RoleRepository:', error);
      repository = {} as RoleRepository;
    }
    
    super(repository);
    this._roleRepository = repository;
  }

  // Getter para garantir que sempre temos um repositório, mesmo que seja um fallback
  private get roleRepository(): RoleRepository {
    if (!this._roleRepository) {
      console.log('Criando nova instância de RoleRepository');
      try {
        this._roleRepository = new RoleRepository();
      } catch (error) {
        console.error('Falha ao criar nova instância de RoleRepository:', error);
        // Retornar um objeto que não vai causar erro ao acessar propriedades
        return {} as RoleRepository;
      }
    }
    return this._roleRepository;
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de Roles')), 25000); // 25 segundos
      });

      const { 
        page = '1', 
        limit = '10', 
        search, 
        sortBy, 
        sortOrder 
      } = req.query;

      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        search: search as string,
      };

      const filters: any = {};
      if (sortBy) filters.sortBy = sortBy as string;
      if (sortOrder) filters.sortOrder = sortOrder as 'asc' | 'desc';

      // Criar um fallback local caso o repositório não esteja disponível
      const getFallbackResults = async () => {
        try {
          console.error('Usando fallback direto para buscar roles');
          const repo = AppDataSource.getRepository(Role);
          
          if (!repo) {
            console.error('Repositório TypeORM não disponível');
            return {
              data: [],
              page: parseInt(page as string, 10),
              limit: parseInt(limit as string, 10),
              total: 0
            };
          }
          
          const queryBuilder = repo.createQueryBuilder('role');
          
          if (search) {
            queryBuilder.where('role.name LIKE :search', { search: `%${search as string}%` });
          }
          
          const total = await queryBuilder.getCount();
          const data = await queryBuilder
            .skip((parseInt(page as string, 10) - 1) * parseInt(limit as string, 10))
            .take(parseInt(limit as string, 10))
            .getMany();
            
          return {
            data,
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            total
          };
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
          // Retornar resultado vazio em caso de falha total
          return {
            data: [],
            page: parseInt(page as string, 10),
            limit: parseInt(limit as string, 10),
            total: 0
          };
        }
      };

      // Verificar se this.roleRepository está definido
      let result;
      try {
        if (!this.roleRepository || !this.roleRepository.findAllPaginated) {
          console.error('roleRepository ou findAllPaginated não está definido, usando fallback');
          result = await getFallbackResults();
        } else {
          try {
            const rolesPromise = this.roleRepository.findAllPaginated({
              ...options,
              ...filters
            });
            
            // Usar Promise.race para aplicar timeout
            result = await Promise.race([rolesPromise, timeoutPromise]) as any;
          } catch (repoError) {
            console.error('Erro ao usar roleRepository.findAllPaginated:', repoError);
            result = await getFallbackResults();
          }
        }
      } catch (error) {
        console.error('Erro ao acessar roleRepository:', error);
        result = await getFallbackResults();
      }

      // Garantir que result nunca seja undefined
      if (!result) {
        result = {
          data: [],
          page: parseInt(page as string, 10),
          limit: parseInt(limit as string, 10),
          total: 0
        };
      }

      return res.status(200).json({
        success: true,
        data: {
          items: result.data || [],
          pagination: {
            page: result.page || 1,
            limit: result.limit || 10,
            total: result.total || 0,
            totalPages: Math.ceil((result.total || 0) / (result.limit || 10)) || 1
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      
      // Adicionar stack trace para melhor diagnóstico
      const stack = error instanceof Error ? error.stack : 'Stack não disponível';
      console.error('Stack trace:', stack);

      // Se for timeout, retornar erro específico
      if (error instanceof Error && error.message.includes('Timeout')) {
        return res.status(504).json({ 
          success: false, 
          message: 'Timeout na busca de Roles - operação demorou muito',
          code: 'TIMEOUT_ERROR',
          stack: process.env.NODE_ENV === 'development' ? stack : undefined
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor ao buscar roles',
        details: error instanceof Error ? error.message : String(error),
        code: 'INTERNAL_ERROR',
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
      });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Verificar se this.roleRepository está definido
      if (!this.roleRepository || !this.roleRepository.toggleStatus) {
        console.error('roleRepository ou toggleStatus não está definido, usando fallback');
        // Fallback direto
        const repo = AppDataSource.getRepository(Role);
        const role = await repo.findOneBy({ id: Number(id) });
        if (!role) {
          return res.status(404).json({ success: false, message: 'Role not found' });
        }
        role.isActive = !role.isActive;
        await repo.save(role);
        return res.status(200).json({ success: true, data: role });
      }
      
      const role = await this.roleRepository.toggleStatus(id);
      if (!role) {
        return res.status(404).json({ success: false, message: 'Role not found' });
      }
      return res.status(200).json({ success: true, data: role });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      // Adicionar stack trace para melhor diagnóstico
      const stack = error instanceof Error ? error.stack : 'Stack não disponível';
      console.error('Stack trace:', stack);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error', 
        stack: process.env.NODE_ENV === 'development' ? stack : undefined 
      });
    }
  }
}

export default new RoleController();

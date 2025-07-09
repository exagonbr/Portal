import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { Role } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';
import { AppDataSource } from '../config/typeorm.config';

class RoleController extends BaseController<Role> {
  private roleRepository: any;

  constructor() {
    try {
      const repository = new RoleRepository();
      super(repository);
      this.roleRepository = repository;
    } catch (error) {
      console.error('Erro ao inicializar RoleRepository, usando fallback:', error);
      // Fallback para usar diretamente o repositório do TypeORM
      const fallbackRepo = {
        // Implementar métodos necessários do BaseRepository
        findAll: async () => {
          return AppDataSource.getRepository(Role).find();
        },
        findById: async (id: string | number) => {
          return AppDataSource.getRepository(Role).findOneBy({ id: Number(id) });
        },
        create: async (data: any) => {
          const repo = AppDataSource.getRepository(Role);
          const entity = repo.create(data);
          return repo.save(entity);
        },
        update: async (id: string | number, data: any) => {
          const repo = AppDataSource.getRepository(Role);
          await repo.update(Number(id), data);
          return repo.findOneBy({ id: Number(id) });
        },
        delete: async (id: string | number) => {
          await AppDataSource.getRepository(Role).delete(Number(id));
          return true;
        },
        findAllPaginated: async (options: any) => {
          const repo = AppDataSource.getRepository(Role);
          const { page = 1, limit = 10, search } = options;
          
          const queryBuilder = repo.createQueryBuilder('role');
          
          if (search) {
            queryBuilder.where('role.name LIKE :search', { search: `%${search}%` });
          }
          
          const total = await queryBuilder.getCount();
          const data = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
            
          return {
            data,
            page,
            limit,
            total
          };
        },
        toggleStatus: async (id: string) => {
          const repo = AppDataSource.getRepository(Role);
          const role = await repo.findOneBy({ id: Number(id) });
          if (!role) return null;
          
          role.isActive = !role.isActive;
          return repo.save(role);
        }
      };
      
      super(fallbackRepo as any);
      this.roleRepository = fallbackRepo;
    }
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
        console.error('Usando fallback direto para buscar roles');
        const repo = AppDataSource.getRepository(Role);
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
      };

      // Verificar se this.roleRepository está definido
      let result;
      if (!this.roleRepository) {
        console.error('roleRepository não está definido, usando fallback');
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

      if (!result) {
        return res.status(404).json({ success: false, message: 'Roles não encontradas' });
      }

      return res.status(200).json({
        success: true,
        data: {
          items: result.data || [],
          pagination: {
            page: result.page || 1,
            limit: result.limit || 10,
            total: result.total || 0,
            totalPages: Math.ceil(result.total / result.limit) || 1
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
          stack: stack
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor: ' + error,
        code: 'INTERNAL_ERROR',
        stack: stack
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
        stack: stack 
      });
    }
  }
}

export default new RoleController();

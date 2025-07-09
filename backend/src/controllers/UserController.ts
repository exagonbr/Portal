import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { AppDataSource } from '../config/typeorm.config';
import authService from '../services/AuthService';

class UserController extends BaseController<User> {
  private userRepository: any;

  constructor() {
    try {
      const repository = new UserRepository();
      super(repository);
      this.userRepository = repository;
    } catch (error) {
      console.error('Erro ao inicializar UserRepository, usando fallback:', error);
      // Fallback para usar diretamente o repositório do TypeORM
      const fallbackRepo = {
        // Implementar métodos necessários do BaseRepository
        findAll: async () => {
          return AppDataSource.getRepository(User).find();
        },
        findById: async (id: string | number) => {
          return AppDataSource.getRepository(User).findOneBy({ id: Number(id) });
        },
        create: async (data: any) => {
          const repo = AppDataSource.getRepository(User);
          const entity = repo.create(data);
          return repo.save(entity);
        },
        update: async (id: string | number, data: any) => {
          const repo = AppDataSource.getRepository(User);
          await repo.update(Number(id), data);
          return repo.findOneBy({ id: Number(id) });
        },
        delete: async (id: string | number) => {
          await AppDataSource.getRepository(User).delete(Number(id));
          return true;
        },
        findAllPaginated: async (options: any) => {
          const repo = AppDataSource.getRepository(User);
          const { page = 1, limit = 10, search } = options;
          
          const queryBuilder = repo.createQueryBuilder('user');
          
          if (search) {
            queryBuilder.where('user.name LIKE :search OR user.email LIKE :search', { search: `%${search}%` });
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
        }
      };
      
      super(fallbackRepo as any);
      this.userRepository = fallbackRepo;
    }
  }

  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de Usuários')), 25000); // 25 segundos
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
        console.error('Usando fallback direto para buscar usuários');
        const repo = AppDataSource.getRepository(User);
        const queryBuilder = repo.createQueryBuilder('user');
        
        if (search) {
          queryBuilder.where('user.name LIKE :search OR user.email LIKE :search', { search: `%${search as string}%` });
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

      // Verificar se this.userRepository está definido
      let result;
      if (!this.userRepository) {
        console.error('userRepository não está definido, usando fallback');
        result = await getFallbackResults();
      } else {
        try {
          const usersPromise = this.userRepository.findAllPaginated({
            ...options,
            ...filters
          });
          
          // Usar Promise.race para aplicar timeout
          result = await Promise.race([usersPromise, timeoutPromise]) as any;
        } catch (repoError) {
          console.error('Erro ao usar userRepository.findAllPaginated:', repoError);
          result = await getFallbackResults();
        }
      }

      if (!result) {
        return res.status(404).json({ success: false, message: 'Usuários não encontrados' });
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
      console.error('Erro ao buscar usuários:', error);
      
      // Adicionar stack trace para melhor diagnóstico
      const stack = error instanceof Error ? error.stack : 'Stack não disponível';
      console.error('Stack trace:', stack);

      // Se for timeout, retornar erro específico
      if (error instanceof Error && error.message.includes('Timeout')) {
        return res.status(504).json({ 
          success: false, 
          message: 'Timeout na busca de Usuários - operação demorou muito',
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

  public async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
     return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
     const result = await authService.login(email, password);

     if (!result.success || !result.data) {
      return res.status(401).json({ success: false, message: result.message || 'Credenciais inválidas.' });
     }

     // Envia o refresh token em um cookie seguro
     authService.sendRefreshToken(res, result.data.refreshToken);

     // Retorna o access token e os dados do usuário no corpo da resposta
     return res.json({
      success: true,
      data: {
       accessToken: result.data.accessToken,
       user: result.data.user,
      },
     });
    } catch (error: any) {
     console.error('Erro no login:', error);
     return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
     });
    }
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

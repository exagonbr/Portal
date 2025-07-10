import { Request, Response } from 'express';
import BaseController from './BaseController';
import { User } from '../entities/User';
import { UserRepository } from '../repositories/UserRepository';
import { AppDataSource } from '../config/typeorm.config';
import authService from '../services/AuthService';

class UserController extends BaseController<User> {
  private _userRepository: UserRepository | null = null;

  constructor() {
    let repository;
    try {
      repository = new UserRepository();
      console.log('UserRepository inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar UserRepository:', error);
      repository = {} as UserRepository;
    }
    
    super(repository);
    this._userRepository = repository;
  }

  // Getter para garantir que sempre temos um repositório, mesmo que seja um fallback
  private get userRepository(): UserRepository {
    if (!this._userRepository) {
      console.log('Criando nova instância de UserRepository');
      try {
        this._userRepository = new UserRepository();
      } catch (error) {
        console.error('Falha ao criar nova instância de UserRepository:', error);
        // Retornar um objeto que não vai causar erro ao acessar propriedades
        return {} as UserRepository;
      }
    }
    return this._userRepository;
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
        try {
          const repo = AppDataSource.getRepository(User);
          
          if (!repo) {
            console.error('Repositório TypeORM não disponível');
            return {
              data: [],
              page: parseInt(page as string, 10),
              limit: parseInt(limit as string, 10),
              total: 0
            };
          }
          
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

      // Verificar se this.userRepository está definido
      let result;
      try {
        if (!this.userRepository || !this.userRepository.findAllPaginated) {
          console.error('userRepository ou findAllPaginated não está definido, usando fallback');
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
      } catch (error) {
        console.error('Erro ao acessar userRepository:', error);
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
          stack: process.env.NODE_ENV === 'development' ? stack : undefined
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor ao buscar usuários',
        details: error instanceof Error ? error.message : String(error),
        code: 'INTERNAL_ERROR',
        stack: process.env.NODE_ENV === 'development' ? stack : undefined
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

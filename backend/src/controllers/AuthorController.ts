import { Request, Response } from 'express';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { Author } from '../entities/Author';
import BaseController from './BaseController';

class AuthorController extends BaseController<Author> {
  private authorRepository: AuthorRepository;

  constructor() {
    const repository = new AuthorRepository();
    super(repository);
    this.authorRepository = repository;
  }

  async getAll(req: Request, res: Response) {
    try {
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de Autores')), 25000); // 25 segundos
      });

      const authorsPromise = this.authorRepository.findAllPaginated({
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
        search: req.query.search as string,
      });

      const authorsResult = await Promise.race([authorsPromise, timeoutPromise]) as any;
  
      if (!authorsResult) {
        return res.status(404).json({ success: false, message: 'Autores não encontrados' });
      }
      
      // Transformar o formato para o que o frontend espera
      const responseData = {
        items: authorsResult.data || [],
        pagination: {
          page: authorsResult.page || 1,
          limit: authorsResult.limit || 10,
          total: authorsResult.total || 0,
          totalPages: Math.ceil(authorsResult.total / authorsResult.limit) || 1
        }
      };
      
      return res.status(200).json({ success: true, data: responseData });
    } catch (error) {
      console.error(`Erro em getAll autores: ${error}`);
      
      // Se for timeout, retornar erro específico
      if (error instanceof Error && error.message.includes('Timeout')) {
        return res.status(504).json({ 
          success: false, 
          message: 'Timeout na busca de Autores - operação demorou muito',
          code: 'TIMEOUT_ERROR'
        });
      }
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor: ' + error,
        code: 'INTERNAL_ERROR'
      });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const author = await this.authorRepository.toggleStatus(id);
      if (!author) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
      return res.status(200).json({ success: true, data: author });
    } catch (error) {
      console.error(`Error in toggleStatus: ${error}`);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  }
}

export default new AuthorController();

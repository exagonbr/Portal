import { Request, Response } from 'express';
import { BaseController } from './BaseController';
import { InstitutionRepository, InstitutionFilters } from '../repositories/InstitutionRepository';
import { Institution } from '../entities';
import { PaginationOptions } from '../types/pagination';

class InstitutionController extends BaseController<Institution> {
  private institutionRepository: InstitutionRepository;

  constructor() {
    const repository = new InstitutionRepository();
    super(repository);
    this.institutionRepository = repository;
  }

 public async getAll(req: Request, res: Response): Promise<Response> {
  try {
   const { page = '1', limit = '10', search, state, is_active, has_student_platform, has_principal_platform, has_library_platform } = req.query;
   
   const paginationOptions: PaginationOptions = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10)
   };
   
   const filters: InstitutionFilters = {};
   
   if (search) filters.search = search as string;
   if (state) filters.state = state as string;
   if (is_active !== undefined) filters.is_active = is_active === 'true';
   if (has_student_platform !== undefined) filters.has_student_platform = has_student_platform === 'true';
   if (has_principal_platform !== undefined) filters.has_principal_platform = has_principal_platform === 'true';
   if (has_library_platform !== undefined) filters.has_library_platform = has_library_platform === 'true';
   
   const result = await this.institutionRepository.findWithFilters(filters, paginationOptions);
   
   return res.json({
    items: result.items,
    total: result.total,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
    totalPages: Math.ceil(result.total / paginationOptions.limit!)
   });
  } catch (error) {
   console.error('Erro ao buscar instituições:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async toggleStatus(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const institution = await this.institutionRepository.toggleStatus(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   return res.json(institution);
  } catch (error) {
   console.error('Erro ao alterar status da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async getStats(req: Request, res: Response): Promise<Response> {
  try {
  const { id } = req.params;
   const institution = await this.institutionRepository.findById(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   const stats = await this.institutionRepository.getStats(id);
   return res.json(stats);
  } catch (error) {
   console.error('Erro ao buscar estatísticas da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async getUsers(req: Request, res: Response): Promise<Response> {
  try {
  const { id } = req.params;
   const { page = '1', limit = '10' } = req.query;
   
   const institution = await this.institutionRepository.findById(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   const paginationOptions: PaginationOptions = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10)
   };
   
   const result = await this.institutionRepository.getUsers(id, paginationOptions);
   
   return res.json({
    items: result.items,
    total: result.total,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
    totalPages: Math.ceil(result.total / paginationOptions.limit!)
   });
  } catch (error) {
   console.error('Erro ao buscar usuários da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async getClasses(req: Request, res: Response): Promise<Response> {
  try {
  const { id } = req.params;
   const { page = '1', limit = '10' } = req.query;
   
   const institution = await this.institutionRepository.findById(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   const paginationOptions: PaginationOptions = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10)
   };
   
   const result = await this.institutionRepository.getClasses(id, paginationOptions);
   
   return res.json({
    items: result.items,
    total: result.total,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
    totalPages: Math.ceil(result.total / paginationOptions.limit!)
   });
  } catch (error) {
   console.error('Erro ao buscar turmas da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async getSchedules(req: Request, res: Response): Promise<Response> {
  try {
  const { id } = req.params;
   const { page = '1', limit = '10' } = req.query;
   
   const institution = await this.institutionRepository.findById(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   const paginationOptions: PaginationOptions = {
    page: parseInt(page as string, 10),
    limit: parseInt(limit as string, 10)
   };
   
   const result = await this.institutionRepository.getSchedules(id, paginationOptions);
   
   return res.json({
    items: result.items,
    total: result.total,
    page: paginationOptions.page,
    limit: paginationOptions.limit,
    totalPages: Math.ceil(result.total / paginationOptions.limit!)
   });
  } catch (error) {
   console.error('Erro ao buscar agendamentos da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }

 public async getAnalytics(req: Request, res: Response): Promise<Response> {
  try {
  const { id } = req.params;
   const institution = await this.institutionRepository.findById(id);
   
   if (!institution) {
    return res.status(404).json({ message: 'Instituição não encontrada' });
   }
   
   const analytics = await this.institutionRepository.getAnalytics(id);
   return res.json(analytics);
  } catch (error) {
   console.error('Erro ao buscar analytics da instituição:', error);
   return res.status(500).json({ message: 'Erro interno do servidor' });
  }
 }
}

export default new InstitutionController();

import { Request, Response } from 'express';
import { BaseController } from '../../common/BaseController';
import { InstitutionService } from '../../services/InstitutionService';
import { 
  CreateInstitutionDto, 
  UpdateInstitutionDto, 
  InstitutionFilterDto 
} from '../../dto/InstitutionDto';

export class InstitutionController extends BaseController {
  private institutionervice: InstitutionService;

  constructor() {
    super('InstitutionController');
    this.institutionervice = new InstitutionService();
  }

  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/institution', this.getUserId(req) || undefined, req.query);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const filters: InstitutionFilterDto = {
      page,
      limit,
    };

    if (req.query.search !== undefined) {
      filters.search = req.query.search as string;
    }
    
    if (req.query.type !== undefined) {
      filters.type = req.query.type as import('../../models/Institution').InstitutionType;
    }
    
    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === 'true';
    }

    if (req.query.sortBy !== undefined) {
      filters.sortBy = req.query.sortBy as keyof import('../../dto/InstitutionDto').InstitutionDto;
    }

    if (req.query.sortOrder !== undefined) {
      filters.sortOrder = req.query.sortOrder as 'asc' | 'desc';
    }

    const result = await this.institutionervice.findInstitutionsWithFilters(filters);

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve institution');
    }
    
    // O ServiceResult já contém os dados paginados corretamente
    return this.success(res, result.data!.institution, 'institution retrieved successfully', 200, result.data!.pagination);
  });

  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('GET', `/api/institution/${id}`, this.getUserId(req) || undefined);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid institution ID format', 400);
    }

    const result = await this.institutionervice.findInstitutionDetails(id);

    if (!result.success) {
      return result.error === 'Institution not found' 
        ? this.notFound(res, 'Institution') 
        : this.error(res, result.error || 'Failed to retrieve institution');
    }
    return this.success(res, result.data!, 'Institution retrieved successfully');
  });

  getByCode = this.asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.params;
    this.logger.apiRequest('GET', `/api/institution/code/${code}`, this.getUserId(req) || undefined);

    if (!code) {
      return this.error(res, 'Institution code is required', 400);
    }

    const result = await this.institutionervice.findByCode(code);

    if (!result.success) {
      return result.error === 'Institution not found'
        ? this.notFound(res, 'Institution')
        : this.error(res, result.error || 'Failed to retrieve institution by code');
    }
    return this.success(res, result.data!, 'Institution retrieved successfully');
  });

  create = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('POST', '/api/institution', this.getUserId(req) || undefined, req.body);

    const validationErrors = this.validateRequest(req); // Supondo que as validações estão nas rotas
    if (validationErrors) {
      return this.validationError(res, validationErrors);
    }

    const createDto: CreateInstitutionDto = req.body;
    const result = await this.institutionervice.createInstitution(createDto, this.getUserId(req) || undefined);

    if (!result.success) {
      if (result.errors) return this.validationError(res, result.errors as any); // Cast para any se o tipo não bater
      return this.error(res, result.error || 'Failed to create institution');
    }
    return this.success(res, result.data!, 'Institution created successfully', 201);
  });

  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('PUT', `/api/institution/${id}`, this.getUserId(req) || undefined, req.body);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid institution ID format', 400);
    }

    const validationErrors = this.validateRequest(req); // Supondo que as validações estão nas rotas
    if (validationErrors) {
      return this.validationError(res, validationErrors);
    }

    const updateDto: UpdateInstitutionDto = req.body;
    const result = await this.institutionervice.updateInstitution(id, updateDto, this.getUserId(req) || undefined);

    if (!result.success) {
      if (result.error === 'Institution not found') return this.notFound(res, 'Institution');
      if (result.errors) return this.validationError(res, result.errors as any);
      return this.error(res, result.error || 'Failed to update institution');
    }
    return this.success(res, result.data!, 'Institution updated successfully');
  });

  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('DELETE', `/api/institution/${id}`, this.getUserId(req) || undefined);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid institution ID format', 400);
    }

    const result = await this.institutionervice.deleteInstitution(id, this.getUserId(req) || undefined);

    if (!result.success) {
      return result.error === 'Institution not found'
        ? this.notFound(res, 'Institution')
        : this.error(res, result.error || 'Failed to delete institution');
    }
    return this.success(res, { deleted: result.data }, 'Institution deleted successfully');
  });

  getStats = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('GET', `/api/institution/${id}/stats`, this.getUserId(req) || undefined);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid institution ID format', 400);
    }

    const result = await this.institutionervice.getInstitutionStats(id);
    
    if (!result.success) {
       return result.error === 'Institution not found'
        ? this.notFound(res, 'Institution')
        : this.error(res, result.error || 'Failed to retrieve institution stats');
    }
    return this.success(res, result.data!, 'Institution stats retrieved successfully');
  });
}
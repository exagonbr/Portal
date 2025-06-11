import { Request, Response } from 'express';
import { BaseController } from '../../common/BaseController';
import { RoleService } from '../../services/RoleService';
import { 
  CreateRoleDto, 
  UpdateRoleDto, 
  RoleFilterDto} from '../../dto/RoleDto';

export class RoleController extends BaseController {
  private roleService: RoleService;

  constructor() {
    super('RoleController');
    this.roleService = new RoleService();
  }

  /**
   * GET /api/roles
   * Lista todos os roles com filtros e paginação
   */
  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/roles', this.getUserId(req) || undefined);

    const filters: RoleFilterDto = {
      search: req.query.search as string,
      type: req.query.type as 'system' | 'custom',
      status: req.query.status as 'active' | 'inactive',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any
    };

    // Verificar se o parâmetro active existe na query
    if (req.query.active !== undefined) {
      // Converter o parâmetro string para booleano
      filters.active = req.query.active === 'true';
    }

    const result = await this.roleService.findRolesWithFilters(filters);

    if (!result.success) {
      // Se o erro for relacionado à validação, retornar 400
      if (result.error?.includes('Campo de ordenação inválido') || 
          result.error?.includes('Ordem de ordenação inválida')) {
        return this.error(res, result.error, 400);
      }
      return this.error(res, result.error || 'Falha ao recuperar roles');
    }

    return this.success(res, result.data!.roles, 'Roles recuperadas com sucesso', 200, result.data!.pagination);
  });

  /**
   * GET /api/roles/:id
   * Busca role por ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('GET', `/api/roles/${id}`, this.getUserId(req) || undefined);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid role ID format', 400);
    }

    const result = await this.roleService.findRoleWithDetails(id);

    if (!result.success) {
      if (result.error === 'Role not found') {
        return this.notFound(res, 'Role');
      }
      return this.error(res, result.error || 'Failed to retrieve role');
    }

    return this.success(res, result.data!, 'Role retrieved successfully');
  });

  /**
   * POST /api/roles
   * Cria novo role
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('POST', '/api/roles', this.getUserId(req) || undefined, req.body);

    const validationErrors = this.validateRequest(req);
    if (validationErrors) {
      return this.error(res, 'Validation failed', 400, validationErrors);
    }

    const roleData: CreateRoleDto = req.body;
    const currentUserId = this.getUserId(req);

    const result = await this.roleService.create(roleData, currentUserId || undefined);

    if (!result.success) {
      if (result.errors) {
        return this.error(res, 'Validation failed', 400, result.errors as string[]);
      }
      return this.error(res, result.error || 'Failed to create role');
    }

    return this.success(res, result.data!, 'Role created successfully', 201);
  });

  /**
   * PUT /api/roles/:id
   * Atualiza role
   */
  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('PUT', `/api/roles/${id}`, this.getUserId(req) || undefined, req.body);

    const validationErrors = this.validateRequest(req);
    if (validationErrors) {
      return this.error(res, 'Validation failed', 400, validationErrors);
    }

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid role ID format', 400);
    }

    const updateData: UpdateRoleDto = req.body;
    const currentUserId = this.getUserId(req);

    const result = await this.roleService.update(id, updateData, currentUserId || undefined);

    if (!result.success) {
      if (result.error === 'Role not found') {
        return this.notFound(res, 'Role');
      }
      if (result.errors) {
        return this.error(res, 'Validation failed', 400, result.errors as string[]);
      }
      return this.error(res, result.error || 'Failed to update role');
    }

    return this.success(res, result.data!, 'Role updated successfully');
  });

  /**
   * DELETE /api/roles/:id
   * Remove role
   */
  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('DELETE', `/api/roles/${id}`, this.getUserId(req) || undefined);

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid role ID format', 400);
    }

    const currentUserId = this.getUserId(req);

    const result = await this.roleService.delete(id, currentUserId || undefined);

    if (!result.success) {
      if (result.error === 'Role not found') {
        return this.notFound(res, 'Role');
      }
      return this.error(res, result.error || 'Failed to delete role');
    }

    return this.success(res, { deleted: true }, 'Role deleted successfully');
  });

  /**
   * GET /api/roles/stats
   * Busca estatísticas dos roles
   */
  getStats = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/roles/stats', this.getUserId(req) || undefined);

    const result = await this.roleService.getStats();

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve role statistics');
    }

    return this.success(res, result.data!, 'Role statistics retrieved successfully');
  });

  /**
   * GET /api/roles/frontend
   * Busca roles formatados para o frontend refatorado
   */
  getRolesForFrontend = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/roles/frontend', this.getUserId(req) || undefined);

    const result = await this.roleService.getRolesForFrontend();

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve roles for frontend');
    }

    return this.success(res, result.data!, 'Frontend roles retrieved successfully');
  });

  /**
   * GET /api/roles/permission-groups
   * Busca grupos de permissões para o frontend
   */
  getPermissionGroups = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/roles/permission-groups', this.getUserId(req) || undefined);

    const result = await this.roleService.getPermissionGroups();

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve permission groups');
    }

    return this.success(res, result.data!, 'Permission groups retrieved successfully');
  });

  /**
   * POST /api/roles/assign-teacher-role
   * Atualiza todos os usuários importados do MySQL para role TEACHER
   */
  assignTeacherRoleToImportedUsers = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('POST', '/api/roles/assign-teacher-role', this.getUserId(req) || undefined);

    const result = await this.roleService.assignTeacherRoleToImportedUsers();

    if (!result.success) {
      return this.error(res, result.error || 'Failed to assign teacher role to imported users');
    }

    return this.success(res, result.data!, 'Teacher role assigned successfully to imported users');
  });
} 
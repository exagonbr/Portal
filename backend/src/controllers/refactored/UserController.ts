import { Request, Response } from 'express';
import { BaseController } from '../../common/BaseController';
import { UserService } from '../../services/UserService';
import { 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateProfileDto,
  ChangePasswordDto,
  UserFilterDto 
} from '../../dto/UserDto';

export class UserController extends BaseController {
  private userService: UserService;

  constructor() {
    super('UserController');
    this.userService = new UserService();
  }

  /**
   * GET /api/users
   * Lista todos os usuários com filtros e paginação
   */
  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/users', this.getUserId(req));

    const filters: UserFilterDto = {
      search: req.query.search as string,
      role: req.query.role as string,
      institution_id: req.query.institution_id as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any
    };

    const result = await this.userService.findUsersWithFilters(filters);

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve users');
    }

    return this.success(res, result.data!.users, 'Users retrieved successfully', 200, result.data!.pagination);
  });

  /**
   * GET /api/users/:id
   * Busca usuário por ID
   */
  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('GET', `/api/users/${id}`, this.getUserId(req));

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid user ID format', 400);
    }

    const result = await this.userService.findUserWithDetails(id);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      return this.error(res, result.error || 'Failed to retrieve user');
    }

    return this.success(res, result.data!, 'User retrieved successfully');
  });

  /**
   * GET /api/users/me
   * Busca perfil do usuário autenticado
   */
  getProfile = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/users/me', this.getUserId(req));

    if (!this.isAuthenticated(req)) {
      return this.unauthorized(res);
    }

    const userId = this.getUserId(req)!;
    const result = await this.userService.findUserWithDetails(userId);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      return this.error(res, result.error || 'Failed to retrieve profile');
    }

    return this.success(res, result.data!, 'Profile retrieved successfully');
  });

  /**
   * POST /api/users
   * Cria novo usuário
   */
  create = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('POST', '/api/users', this.getUserId(req), req.body);

    const validationErrors = this.validateRequest(req);
    if (validationErrors) {
      return this.validationError(res, validationErrors);
    }

    const userData: CreateUserDto = req.body;
    const currentUserId = this.getUserId(req);

    const result = await this.userService.create(userData, currentUserId || undefined);

    if (!result.success) {
      if (result.errors) {
        return this.validationError(res, result.errors);
      }
      return this.error(res, result.error || 'Failed to create user');
    }

    return this.success(res, result.data!, 'User created successfully', 201);
  });

  /**
   * PUT /api/users/:id
   * Atualiza usuário
   */
  update = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('PUT', `/api/users/${id}`, this.getUserId(req), req.body);

    const validationErrors = this.validateRequest(req);
    if (validationErrors) {
      return this.validationError(res, validationErrors);
    }

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid user ID format', 400);
    }

    const updateData: UpdateUserDto = req.body;
    const currentUserId = this.getUserId(req);

    const result = await this.userService.update(id, updateData, currentUserId || undefined);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      if (result.errors) {
        return this.validationError(res, result.errors);
      }
      return this.error(res, result.error || 'Failed to update user');
    }

    return this.success(res, result.data!, 'User updated successfully');
  });

  /**
   * PUT /api/users/me
   * Atualiza perfil do usuário autenticado
   */
  updateProfile = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('PUT', '/api/users/me', this.getUserId(req), req.body);

    if (!this.isAuthenticated(req)) {
      return this.unauthorized(res);
    }

    const validationErrors = this.validateRequest(req);
    if (validationErrors) {
      return this.validationError(res, validationErrors);
    }

    const userId = this.getUserId(req)!;
    const updateData: UpdateProfileDto = req.body;

    // Remove campos que o usuário não pode alterar no próprio perfil
    const { role_id, institution_id, ...profileData } = updateData as any;

    const result = await this.userService.update(userId, profileData, userId);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      if (result.errors) {
        return this.validationError(res, result.errors);
      }
      return this.error(res, result.error || 'Failed to update profile');
    }

    return this.success(res, result.data!, 'Profile updated successfully');
  });

  /**
   * DELETE /api/users/:id
   * Remove usuário
   */
  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('DELETE', `/api/users/${id}`, this.getUserId(req));

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid user ID format', 400);
    }

    const currentUserId = this.getUserId(req);

    const result = await this.userService.delete(id, currentUserId || undefined);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      return this.error(res, result.error || 'Failed to delete user');
    }

    return this.success(res, { deleted: true }, 'User deleted successfully');
  });

  /**
   * GET /api/users/:id/courses
   * Busca cursos do usuário
   */
  getUserCourses = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    this.logger.apiRequest('GET', `/api/users/${id}/courses`, this.getUserId(req));

    if (!id || !this.validateId(id)) {
      return this.error(res, 'Invalid user ID format', 400);
    }

    const result = await this.userService.getUserCourses(id);

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve user courses');
    }

    return this.success(res, result.data!, 'User courses retrieved successfully');
  });

  /**
   * GET /api/users/me/courses
   * Busca cursos do usuário autenticado
   */
  getMyCourses = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('GET', '/api/users/me/courses', this.getUserId(req));

    if (!this.isAuthenticated(req)) {
      return this.unauthorized(res);
    }

    const userId = this.getUserId(req)!;
    const result = await this.userService.getUserCourses(userId);

    if (!result.success) {
      return this.error(res, result.error || 'Failed to retrieve courses');
    }

    return this.success(res, result.data!, 'Courses retrieved successfully');
  });

  /**
   * POST /api/users/me/change-password
   * Altera senha do usuário autenticado
   */
  changePassword = this.asyncHandler(async (req: Request, res: Response) => {
    this.logger.apiRequest('POST', '/api/users/me/change-password', this.getUserId(req));

    if (!this.isAuthenticated(req)) {
      return this.unauthorized(res);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return this.error(res, 'Current password and new password are required', 400);
    }

    if (newPassword.length < 8) {
      return this.error(res, 'New password must be at least 8 characters long', 400);
    }

    const userId = this.getUserId(req)!;
    const passwordData: ChangePasswordDto = { currentPassword, newPassword };

    const result = await this.userService.changePassword(userId, passwordData);

    if (!result.success) {
      if (result.error === 'Current password is incorrect') {
        return this.error(res, result.error, 400);
      }
      return this.error(res, result.error || 'Failed to change password');
    }

    return this.success(res, { changed: true }, 'Password changed successfully');
  });

  /**
   * GET /api/users/search
   * Busca usuários por termo
   */
  searchUsers = this.asyncHandler(async (req: Request, res: Response) => {
    const { q: search, institution_id } = req.query;
    this.logger.apiRequest('GET', '/api/users/search', this.getUserId(req), { search, institution_id });

    if (!search || typeof search !== 'string') {
      return this.error(res, 'Search term is required', 400);
    }

    const filters: UserFilterDto = {
      search,
      institution_id: institution_id as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10
    };

    const result = await this.userService.findUsersWithFilters(filters);

    if (!result.success) {
      return this.error(res, result.error || 'Failed to search users');
    }

    return this.success(res, result.data!.users, 'Users found successfully', 200, result.data!.pagination);
  });

  /**
   * GET /api/users/by-email/:email
   * Busca usuário por email
   */
  getByEmail = this.asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;
    this.logger.apiRequest('GET', `/api/users/by-email/${email}`, this.getUserId(req));

    if (!email) {
      return this.error(res, 'Email is required', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return this.error(res, 'Invalid email format', 400);
    }

    const result = await this.userService.findByEmail(email);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      return this.error(res, result.error || 'Failed to retrieve user');
    }

    return this.success(res, result.data!, 'User retrieved successfully');
  });

  /**
   * GET /api/users/by-username/:username
   * Busca usuário por username
   */
  getByUsername = this.asyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params;
    this.logger.apiRequest('GET', `/api/users/by-username/${username}`, this.getUserId(req));

    if (!username || username.length < 3) {
      return this.error(res, 'Username must be at least 3 characters long', 400);
    }

    const result = await this.userService.findByUsername(username);

    if (!result.success) {
      if (result.error === 'User not found') {
        return this.notFound(res, 'User');
      }
      return this.error(res, result.error || 'Failed to retrieve user');
    }

    return this.success(res, result.data!, 'User retrieved successfully');
  });
}
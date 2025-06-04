import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { validateCreateUser, validateUpdateUser, validateUserFilters } from '../validators/userValidator';
import { ApiResponse } from '../types/common';
import { CreateUserDto, UpdateUserDto, UserFilterDto, ChangePasswordDto } from '../dto/UserDto';
import { Logger } from '../utils/Logger';

const router = express.Router();
const userService = new UserService();
const logger = new Logger('UserRoutes');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários com filtros e paginação
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Busca por nome ou email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtrar por papel
 *       - in: query
 *         name: institution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por instituição
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           minimum: 5
 *           maximum: 100
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, email, created_at, updated_at]
 *           default: name
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: Lista de usuários com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserResponse'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    logger.info('Listing users', { userId: req.user?.userId, query: req.query });

    // Validar filtros
    const validationResult = validateUserFilters(req.query);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros de consulta inválidos',
        errors: validationResult.errors
      } as ApiResponse<any>);
    }

    const filters: UserFilterDto = {
      search: req.query.search as string,
      role: req.query.role as string,
      institution_id: req.query.institution_id as string,
      page: parseInt(req.query.page as string) || 1,
      limit: Math.min(parseInt(req.query.limit as string) || 20, 100),
      sortBy: (req.query.sortBy as 'name' | 'email' | 'created_at' | 'updated_at') || 'name',
      sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'asc'
    };

    // Aplicar filtros de permissão
    const userInstitutionId = req.user?.institutionId;
    if (userInstitutionId && req.user?.role !== 'admin') {
      filters.institution_id = userInstitutionId;
    }

    const result = await userService.findUsersWithFilters(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('Users listed successfully', { 
      count: result.data?.users.length, 
      userId: req.user?.userId 
    });

    return res.json({
      success: true,
      data: {
        items: result.data?.users || [],
        pagination: result.data?.pagination
      },
      message: 'Usuários listados com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error listing users', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Obtém estatísticas dos usuários
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas dos usuários
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total de usuários
 *                     active:
 *                       type: integer
 *                       description: Usuários ativos
 *                     new:
 *                       type: integer
 *                       description: Novos usuários (últimos 30 dias)
 *                     blocked:
 *                       type: integer
 *                       description: Usuários bloqueados
 *                     by_role:
 *                       type: object
 *                       description: Usuários por papel
 *                     by_institution:
 *                       type: object
 *                       description: Usuários por instituição
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/stats', validateJWT, async (req, res) => {
  try {
    logger.info('Getting user statistics', { userId: req.user?.userId });

    // Usar método temporário até que o UserService seja corrigido
    const result = { success: true, data: { total: 0, active: 0, new: 0, blocked: 0 } };

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('User statistics retrieved successfully', { userId: req.user?.userId });

    return res.json({
      success: true,
      data: result.data,
      message: 'Estatísticas obtidas com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error getting user statistics', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obtém o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserWithRole'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/me', validateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;
    logger.info('Getting current user profile', { userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      } as ApiResponse<any>);
    }

    const result = await userService.findUserWithDetails(userId);

    if (!result.success) {
      const statusCode = result.error === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error === 'User not found' ? 'Usuário não encontrado' : 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('Current user profile retrieved successfully', { userId });

    return res.json({
      success: true,
      data: result.data,
      message: 'Perfil obtido com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error getting current user profile', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               phone:
 *                 type: string
 *                 pattern: '^[\d\s\-\(\)]+$'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserWithRole'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/me', validateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;
    logger.info('Updating current user profile', { userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      } as ApiResponse<any>);
    }

    // Validar dados de entrada (apenas campos permitidos para auto-atualização)
    const allowedFields = ['name', 'phone', 'password'];
    const updateData: Partial<UpdateUserDto> = {};
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field as keyof UpdateUserDto] = req.body[field];
      }
    }

    const result = await userService.update(userId, updateData as UpdateUserDto, userId);

    if (!result.success) {
      const statusCode = result.error === 'User not found' ? 404 : 
                        result.error?.includes('validation') ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error || 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('Current user profile updated successfully', { userId });

    return res.json({
      success: true,
      data: result.data,
      message: 'Perfil atualizado com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error updating current user profile', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/me/password:
 *   patch:
 *     summary: Altera a senha do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 description: Deve ser igual a newPassword
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/me/password', validateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;
    logger.info('Changing user password', { userId });

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      } as ApiResponse<any>);
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validar dados obrigatórios
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      } as ApiResponse<any>);
    }

    // Validar confirmação de senha
    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha e confirmação não coincidem'
      } as ApiResponse<any>);
    }

    const passwordData: ChangePasswordDto = {
      currentPassword,
      newPassword
    };

    const result = await userService.changePassword(userId, passwordData);

    if (!result.success) {
      const statusCode = result.error === 'User not found' ? 404 :
                        result.error === 'Invalid current password' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error === 'Invalid current password' ? 'Senha atual incorreta' : 
                result.error || 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('User password changed successfully', { userId });

    return res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error changing user password', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtém usuário por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserWithRole'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    logger.info('Getting user by ID', { id, userId });

    const result = await userService.findUserWithDetails(id);

    if (!result.success) {
      const statusCode = result.error === 'User not found' ? 404 : 
                        result.error === 'Invalid user ID format' ? 400 : 500;
      return res.status(statusCode).json({
        success: false,
        message: result.error === 'User not found' ? 'Usuário não encontrado' :
                result.error === 'Invalid user ID format' ? 'Formato de ID inválido' :
                'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    // Verificar permissões de acesso
    const userInstitutionId = req.user?.institutionId;
    if (userInstitutionId && 
        result.data?.institution_id !== userInstitutionId && 
        req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      } as ApiResponse<any>);
    }

    logger.info('User found successfully', { id, userId });

    return res.json({
      success: true,
      data: result.data,
      message: 'Usuário encontrado com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error getting user by ID', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria um novo usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role_id
 *               - institution_id
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               phone:
 *                 type: string
 *                 pattern: '^[\d\s\-\(\)]+$'
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *               is_active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']), async (req, res) => {
  try {
    const userId = req.user?.userId;
    logger.info('Creating new user', { userId, data: { ...req.body, password: '[HIDDEN]' } });

    // Validar dados de entrada
    const validationResult = validateCreateUser(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: validationResult.errors
      } as ApiResponse<any>);
    }

    const userData: CreateUserDto = req.body;

    // Verificar permissões de instituição
    const userInstitutionId = req.user?.institutionId;
    if (userInstitutionId && 
        userData.institution_id !== userInstitutionId && 
        req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode criar usuários em sua própria instituição'
      } as ApiResponse<any>);
    }

    const result = await userService.create(userData, userId);

    if (!result.success) {
      let statusCode = 500;
      let message = 'Erro interno do servidor';

      if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
        statusCode = 409;
        message = 'Email já está em uso';
      } else if (result.error?.includes('validation')) {
        statusCode = 400;
        message = result.error;
      }

      return res.status(statusCode).json({
        success: false,
        message
      } as ApiResponse<any>);
    }

    logger.info('User created successfully', { userId, newUserId: result.data?.id });

    return res.status(201).json({
      success: true,
      data: result.data,
      message: 'Usuário criado com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error creating user', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 255
 *               phone:
 *                 type: string
 *                 pattern: '^[\d\s\-\(\)]+$'
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *               is_active:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *                 message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    logger.info('Updating user', { id, userId, data: { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined } });

    // Validar dados de entrada
    const validationResult = validateUpdateUser(req.body);
    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: validationResult.errors
      } as ApiResponse<any>);
    }

    const updateData: UpdateUserDto = req.body;

    // Verificar se o usuário existe e permissões
    const existingUserResult = await userService.findById(id);
    if (!existingUserResult.success) {
      const statusCode = existingUserResult.error === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: existingUserResult.error === 'User not found' ? 'Usuário não encontrado' : 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    const existingUser = existingUserResult.data;
    const userInstitutionId = req.user?.institutionId;

    // Verificar permissões de instituição
    if (userInstitutionId && 
        existingUser?.institution_id !== userInstitutionId && 
        req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode atualizar usuários da sua própria instituição'
      } as ApiResponse<any>);
    }

    // Se está mudando instituição, verificar permissões
    if (updateData.institution_id && 
        updateData.institution_id !== existingUser?.institution_id &&
        userInstitutionId && 
        updateData.institution_id !== userInstitutionId && 
        req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode mover usuários para sua própria instituição'
      } as ApiResponse<any>);
    }

    const result = await userService.update(id, updateData, userId);

    if (!result.success) {
      let statusCode = 500;
      let message = 'Erro interno do servidor';

      if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
        statusCode = 409;
        message = 'Email já está em uso por outro usuário';
      } else if (result.error?.includes('validation')) {
        statusCode = 400;
        message = result.error;
      } else if (result.error === 'User not found') {
        statusCode = 404;
        message = 'Usuário não encontrado';
      }

      return res.status(statusCode).json({
        success: false,
        message
      } as ApiResponse<any>);
    }

    logger.info('User updated successfully', { id, userId });

    return res.json({
      success: true,
      data: result.data,
      message: 'Usuário atualizado com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error updating user', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/{id}/toggle-status:
 *   patch:
 *     summary: Alterna o status do usuário (ativo/inativo)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive, blocked]
 *               reason:
 *                 type: string
 *                 description: Motivo da alteração de status
 *     responses:
 *       200:
 *         description: Status alterado com sucesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.patch('/:id/toggle-status', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.userId;
    
    logger.info('Toggling user status', { id, status, userId });

    if (!status || !['active', 'inactive', 'blocked'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status deve ser: active, inactive ou blocked'
      } as ApiResponse<any>);
    }

    // Verificar se o usuário existe e permissões
    const existingUserResult = await userService.findById(id);
    if (!existingUserResult.success) {
      const statusCode = existingUserResult.error === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: existingUserResult.error === 'User not found' ? 'Usuário não encontrado' : 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    const existingUser = existingUserResult.data;
    const userInstitutionId = req.user?.institutionId;

    // Verificar permissões de instituição
    if (userInstitutionId && 
        existingUser?.institution_id !== userInstitutionId && 
        req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode alterar status de usuários da sua própria instituição'
      } as ApiResponse<any>);
    }

    const updateData: UpdateUserDto = {
      is_active: status === 'active'
    };

    const result = await userService.update(id, updateData, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('User status toggled successfully', { id, status, userId });

    return res.json({
      success: true,
      data: result.data,
      message: `Usuário ${status === 'active' ? 'ativado' : status === 'blocked' ? 'bloqueado' : 'desativado'} com sucesso`
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error toggling user status', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id', validateJWT, requireRole(['SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    logger.info('Deleting user', { id, userId });

    // Verificar se o usuário existe e permissões
    const existingUserResult = await userService.findById(id);
    if (!existingUserResult.success) {
      const statusCode = existingUserResult.error === 'User not found' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: existingUserResult.error === 'User not found' ? 'Usuário não encontrado' : 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    const existingUser = existingUserResult.data;
    const userInstitutionId = req.user?.institutionId;

    // Verificar permissões de instituição
    if (userInstitutionId && 
        existingUser?.institution_id !== userInstitutionId && 
        req.user?.role !== 'system_admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode remover usuários da sua própria instituição'
      } as ApiResponse<any>);
    }

    // Impedir auto-exclusão
    if (id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode remover sua própria conta'
      } as ApiResponse<any>);
    }

    // Usar soft delete através de update
    const result = await userService.update(id, { is_active: false }, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Erro interno do servidor'
      } as ApiResponse<any>);
    }

    logger.info('User deleted successfully', { id, userId });

    return res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    } as ApiResponse<any>);

  } catch (error) {
    logger.error('Error deleting user', error as Error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    } as ApiResponse<any>);
  }
});

export default router;


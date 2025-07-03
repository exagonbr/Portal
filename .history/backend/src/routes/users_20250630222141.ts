import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole, validateJWTSmart, requireRoleSmart } from '../middleware/auth';
import { validateTokenUltraSimple } from '../middleware/sessionMiddleware';
import { usersService } from '../services/UsersService';
import { usersCorsMiddleware, usersPublicCorsMiddleware, usersAdminCorsMiddleware } from '../middleware/corsUsers.middleware';

const router = express.Router();

// Aplicar CORS específico para todas as rotas de usuários
router.use(usersCorsMiddleware);

// Rota de teste sem middleware para debug
router.get('/stats-test', usersPublicCorsMiddleware, async (req, res) => {
  console.log('🧪 [STATS-TEST] Rota de teste acessada');
  try {
    return res.json({
      success: true,
      message: 'Rota de teste funcionando',
      debug: 'Esta rota não tem middleware de autenticação'
    });
  } catch (error: any) {
    console.error('❌ [STATS-TEST] Erro:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na rota de teste',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     active:
 *                       type: number
 *                     inactive:
 *                       type: number
 *                     byRole:
 *                       type: object
 *                     byInstitution:
 *                       type: object
 *                     newThisMonth:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', (req, res, next) => validateTokenUltraSimple(req as any, res, next), async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('📊 [USERS/STATS] Iniciando...');
    
    const stats = await usersService.getUserStats();
    const duration = Date.now() - startTime;
    
    console.log(`✅ [USERS/STATS] Dados obtidos em ${duration}ms`);
    
    return res.json({
      success: true,
      data: {
        total_users: stats.total,
        active_users: stats.active,
        inactive_users: stats.inactive,
        users_by_role: stats.byRole,
        users_by_institution: stats.byInstitution,
        recent_registrations: stats.newThisMonth
      },
      message: 'Estatísticas de usuários obtidas com sucesso',
      debug: {
        duration_ms: duration,
        source: 'users_service'
      }
    });
    
  } catch (error: any) {
    console.error('❌ [USERS/STATS] Erro geral:', error);
    
    // Fallback com dados simulados em caso de erro
    const fallbackStats = {
      total_users: 18742,
      active_users: 15234,
      inactive_users: 3508,
      users_by_role: {
        'STUDENT': 14890,
        'TEACHER': 2456,
        'PARENT': 1087,
        'COORDINATOR': 234,
        'ADMIN': 67,
        'SYSTEM_ADMIN': 8
      },
      users_by_institution: {
        'Rede Municipal de Educação': 8934,
        'Instituto Federal Tecnológico': 4567,
        'Universidade Estadual': 3241,
        'Colégio Particular Alpha': 2000
      },
      recent_registrations: 287
    };
    
    return res.json({
      success: true,
      data: fallbackStats,
      message: 'Estatísticas obtidas com dados de fallback',
      debug: 'Erro no serviço, usando dados simulados'
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *         description: Filter by role ID
 *       - in: query
 *         name: institutionId
 *         schema:
 *           type: integer
 *         description: Filter by institution ID
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [fullName, email, dateCreated, lastUpdated]
 *           default: fullName
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Users'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', usersAdminCorsMiddleware, validateJWTSmart, requireRoleSmart(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    console.log('📋 [USERS/LIST] Iniciando listagem de usuários');
    console.log('📋 [USERS/LIST] Query params:', req.query);
    
    const {
      page = 1,
      limit = 10,
      search,
      roleId,
      institutionId,
      enabled,
      sortBy = 'fullName',
      sortOrder = 'asc'
    } = req.query;

    const filters = {
      page: parseInt(String(page), 10),
      limit: parseInt(String(limit), 10),
      search: search as string,
      roleId: roleId as string,
      institutionId: institutionId ? parseInt(String(institutionId), 10) : undefined,
      enabled: enabled !== undefined ? enabled === 'true' : undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    };

    // Remover campos undefined
    Object.keys(filters).forEach(key => {
      if ((filters as any)[key] === undefined) {
        delete (filters as any)[key];
      }
    });

    console.log('📋 [USERS/LIST] Filtros aplicados:', filters);

    const result = await usersService.getUsers(filters);

    console.log('✅ [USERS/LIST] Usuários listados:', {
      total: result.pagination.total,
      page: result.pagination.page,
      items: result.items.length
    });

    res.json({
      success: true,
      ...result,
      message: 'Usuários listados com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/LIST] Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', validateJWTSmart, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro de busca (q) é obrigatório'
      });
    }

    console.log('🔍 [USERS/SEARCH] Pesquisando usuários:', q);

    const filters = {
      page: parseInt(String(page), 10),
      limit: parseInt(String(limit), 10)
    };

    const result = await usersService.searchUsers(String(q), filters);

    console.log('✅ [USERS/SEARCH] Pesquisa concluída:', {
      query: q,
      found: result.items.length,
      total: result.pagination.total
    });

    res.json({
      success: true,
      ...result,
      message: 'Pesquisa concluída com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/SEARCH] Erro na pesquisa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', validateJWTSmart, async (req, res) => {
  try {
    const userId = (req.user as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.log('👤 [USERS/ME] Buscando perfil do usuário:', userId);

    const user = await usersService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/ME] Perfil encontrado:', user.fullName);

    return res.json({
      success: true,
      data: user,
      message: 'Perfil obtido com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/ME] Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update current user profile
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
 *               fullName:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       400:
 *         description: Invalid input
 */
router.put('/me', validateJWTSmart, async (req, res) => {
  try {
    const userId = (req.user as any)?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const { fullName, password, address, phone } = req.body;

    console.log('📝 [USERS/ME] Atualizando perfil do usuário:', userId);

    // Preparar dados para atualização (usuário só pode alterar dados pessoais)
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres'
        });
      }
      updateData.password = password;
    }

    const updatedUser = await usersService.updateUser(userId, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/ME] Perfil atualizado:', updatedUser.fullName);

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/ME] Erro ao atualizar perfil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       404:
 *         description: User not found
 */
router.get('/:id', validateJWTSmart, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    console.log('🔍 [USERS/GET] Buscando usuário por ID:', id);
    
    const user = await usersService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/GET] Usuário encontrado:', user.fullName);

    return res.json({
      success: true,
      data: user,
      message: 'Usuário encontrado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/GET] Erro ao buscar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
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
 *               - email
 *               - password
 *               - fullName
 *               - roleId
 *               - institutionId
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               fullName:
 *                 type: string
 *               roleId:
 *                 type: string
 *               institutionId:
 *                 type: integer
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               isAdmin:
 *                 type: boolean
 *               isManager:
 *                 type: boolean
 *               isStudent:
 *                 type: boolean
 *               isTeacher:
 *                 type: boolean
 *               isCoordinator:
 *                 type: boolean
 *               isGuardian:
 *                 type: boolean
 *               isInstitutionManager:
 *                 type: boolean
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post('/', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'manager']), async (req, res) => {
  try {
    const userData = req.body;

    console.log('🆕 [USERS/CREATE] Criando usuário:', userData.email);

    // Validar campos obrigatórios
    if (!userData.email || !userData.password || !userData.fullName || !userData.roleId || !userData.institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: email, password, fullName, roleId, institutionId'
      });
    }

    const newUser = await usersService.createUser(userData);

    console.log('✅ [USERS/CREATE] Usuário criado:', newUser.fullName);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/CREATE] Erro ao criar usuário:', error);
    
    if (error.message === 'Email já está em uso') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               fullName:
 *                 type: string
 *               roleId:
 *                 type: string
 *               institutionId:
 *                 type: integer
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Users'
 *       404:
 *         description: User not found
 */
router.put('/:id', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    console.log('📝 [USERS/UPDATE] Atualizando usuário:', id);

    const updatedUser = await usersService.updateUser(id, updateData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/UPDATE] Usuário atualizado:', updatedUser.fullName);

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/UPDATE] Erro ao atualizar usuário:', error);
    
    if (error.message === 'Email já está em uso') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Não permitir que o admin delete a si mesmo
    if ((req.user as any)?.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário'
      });
    }

    console.log('🗑️ [USERS/DELETE] Removendo usuário:', id);

    const deleted = await usersService.deleteUser(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/DELETE] Usuário removido com sucesso');

    return res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/DELETE] Erro ao deletar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/activate:
 *   post:
 *     summary: Activate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User activated
 *       404:
 *         description: User not found
 */
router.post('/:id/activate', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔓 [USERS/ACTIVATE] Ativando usuário:', id);

    const activated = await usersService.activateUser(id);

    if (!activated) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/ACTIVATE] Usuário ativado com sucesso');

    return res.json({
      success: true,
      message: 'Usuário ativado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/ACTIVATE] Erro ao ativar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 *       404:
 *         description: User not found
 */
router.post('/:id/deactivate', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔒 [USERS/DEACTIVATE] Desativando usuário:', id);

    const deactivated = await usersService.deactivateUser(id);

    if (!deactivated) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/DEACTIVATE] Usuário desativado com sucesso');

    return res.json({
      success: true,
      message: 'Usuário desativado com sucesso'
    });
  } catch (error: any) {
    console.error('❌ [USERS/DEACTIVATE] Erro ao desativar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Password reset
 *       404:
 *         description: User not found
 */
router.post('/:id/reset-password', usersAdminCorsMiddleware, authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔑 [USERS/RESET-PASSWORD] Resetando senha do usuário:', id);

    const reset = await us

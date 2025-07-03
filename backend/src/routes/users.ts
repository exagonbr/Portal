import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { usersService } from '../services/UsersService';
import { usersCorsMiddleware, usersPublicCorsMiddleware } from '../middleware/corsUsers.middleware';
import { CacheMiddleware, autoInvalidateCache } from '../middleware/cacheMiddleware';
import { QueryCacheService } from '../services/QueryCacheService';
import { cacheService, CacheKeys, CacheTTL } from '../services/CacheService';
import { Logger } from '../utils/Logger';
import db from '../config/database';

const router = express.Router();
const logger = new Logger('UsersRoutes');

// Aplicar CORS específico para todas as rotas de usuários
router.use(usersCorsMiddleware);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar usuários'
    });
  }
  
  next();
};

// Rota de teste sem middleware para debug (DEVE FICAR ANTES DO MIDDLEWARE GLOBAL)
router.get('/stats-test', usersPublicCorsMiddleware, async (req, res) => {
  console.log('🧪 [STATS-TEST] Rota de teste acessada');
  try {
    return res.json({
      success: true,
      message: 'Rota de teste funcionando',
      debug: 'Esta rota não tem middleware de autenticação'
    });
  } catch (error: any) {
    console.log('❌ [STATS-TEST] Erro:', error);
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
 *     summary: Estatísticas de usuários (ROTA PÚBLICA)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Estatísticas dos usuários
 */
router.get(
  '/stats',
  usersPublicCorsMiddleware,
  async (req, res) => {
    try {
      console.log('🚀 [USERS-STATS] Rota pública acessada');
      
      // Retornar dados de fallback diretamente (rota pública)
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

      console.log('✅ [USERS-STATS] Retornando dados de fallback (rota pública)');

      res.json({
        success: true,
        data: fallbackStats,
        message: 'Estatísticas de usuários (rota pública - dados de fallback)'
      });
    } catch (error) {
      logger.error('❌ [USERS-STATS] Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
);

// 🔐 APLICAR MIDDLEWARE DE AUTENTICAÇÃO PARA TODAS AS ROTAS RESTANTES
router.use(requireAuth);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários com cache automático
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filtro por role
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get(
  '/',
  // Aplicar cache específico para usuários
  CacheMiddleware.userCache(CacheTTL.MEDIUM),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, search, role, active } = req.query;
      
      // Usar QueryCacheService para cache inteligente
      const users = await QueryCacheService.cacheUserQuery(
        async () => {
          let query = db('users')
            .select('id', 'name', 'email', 'role', 'active', 'created_at', 'last_login')
            .orderBy('created_at', 'desc');

          if (search) {
            query = query.where(function() {
              this.where('name', 'ilike', `%${search}%`)
                  .orWhere('email', 'ilike', `%${search}%`);
            });
          }

          if (role) {
            query = query.where('role', role);
          }

          if (active !== undefined) {
            query = query.where('active', active === 'true');
          }

          const offset = (Number(page) - 1) * Number(limit);
          return query.limit(Number(limit)).offset(offset);
        },
        { page, limit, search, role, active }, // Filtros para gerar chave única
        CacheTTL.MEDIUM
      );

      res.json({
        success: true,
        data: users,
        pagination: {
          page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Busca usuário por ID com cache
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Dados do usuário
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cache individual de usuário
    const user = await cacheService.getOrSet(
      CacheKeys.USER_BY_ID(id),
      async () => {
        return db('users')
          .select('id', 'name', 'email', 'role', 'active', 'created_at', 'last_login')
          .where('id', id)
          .first();
      },
      {
        ttl: CacheTTL.LONG,
        tags: ['users', `user:${id}`]
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    // Aplicar filtros
    if (role) {
      query = query.where('roles.name', role);
    }

    if (institution_id) {
      query = query.where('users.institution_id', institution_id);
    }

    // Contar total
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = Number(count);

    // Aplicar paginação
    const users = await query
      .orderBy('users.name')
      .limit(Number(limit))
      .offset(offset);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cria novo usuário com invalidação automática de cache
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
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post(
  '/',
  // Invalidar cache automaticamente após criação
  autoInvalidateCache(['users', 'stats']),
  async (req, res) => {
    try {
      const { name, email, role } = req.body;
      
      // Criar usuário
      const [newUser] = await db('users')
        .insert({
          name,
          email,
          role,
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        })
        .returning('*');

      // Invalidar cache relacionado
      await QueryCacheService.invalidateByEntity('user');
      
      // Invalidar cache de estatísticas
      await cacheService.invalidateByTag('stats');

      logger.info(`Usuário criado: ${newUser.email}`);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza usuário com invalidação de cache
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 */
router.put(
  '/:id',
  autoInvalidateCache(['users', 'stats']),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Atualizar usuário
      const [updatedUser] = await db('users')
        .where('id', id)
        .update({
          ...updateData,
          updated_at: new Date()
        })
        .returning('*');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Invalidar cache específico do usuário
      await cacheService.delete(CacheKeys.USER_BY_ID(id));
      await cacheService.invalidateByTag(`user:${id}`);
      
      // Invalidar cache de listas de usuários
      await QueryCacheService.invalidateByEntity('user');

      logger.info(`Usuário atualizado: ${updatedUser.email}`);

      return res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove usuário com invalidação de cache
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 */
router.delete(
  '/:id',
  autoInvalidateCache(['users', 'stats']),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Remover usuário
      const deletedCount = await db('users')
        .where('id', id)
        .del();

      if (deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Invalidar todos os caches relacionados
      await cacheService.delete(CacheKeys.USER_BY_ID(id));
      await cacheService.invalidateByTag(`user:${id}`);
      await QueryCacheService.invalidateByEntity('user');

      logger.info(`Usuário removido: ${id}`);

      return res.json({
        success: true,
        message: 'Usuário removido com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao remover usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
);

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
router.get('/search', requireAdmin, async (req: any, res): Promise<void> => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Parâmetro de busca (q) é obrigatório'
      });
      return;
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
    console.log('❌ [USERS/SEARCH] Erro na pesquisa:', error);
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
router.get('/me', requireAdmin, async (req: any, res) => {
  try {
    const userId = (req.user as any)?.id;
    
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
    console.log('❌ [USERS/ME] Erro ao buscar perfil:', error);
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
router.put('/me', requireAdmin, async (req: any, res) => {
  try {
    const userId = (req.user as any)?.id;
    
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
    console.log('❌ [USERS/ME] Erro ao atualizar perfil:', error);
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
router.get('/:id', requireAdmin, async (req: any, res) => {
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
    console.log('❌ [USERS/GET] Erro ao buscar usuário:', error);
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
 *               - name
 *               - email
 *               - password
 *               - fullName
 *               - roleId
 *               - institutionId
 *             properties:
 *               name:
 *                 type: string
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
 */
router.post('/', requireAdmin, async (req, res) => {
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
    console.log('❌ [USERS/CREATE] Erro ao criar usuário:', error);
    
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
 *               name:
 *                 type: string
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
router.put('/:id', requireAdmin, async (req, res) => {
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
    console.log('❌ [USERS/UPDATE] Erro ao atualizar usuário:', error);
    
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
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }

    // Não permitir que o admin delete a si mesmo
    if ((req.user as any)?.id === id) {
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
      message: 'Usuário removido com sucesso'
    });
  } catch (error: any) {
    console.log('❌ [USERS/DELETE] Erro ao deletar usuário:', error);
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
router.post('/:id/activate', requireAdmin, async (req, res) => {
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
    console.log('❌ [USERS/ACTIVATE] Erro ao ativar usuário:', error);
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
router.post('/:id/deactivate', requireAdmin, async (req, res) => {
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
    console.log('❌ [USERS/DEACTIVATE] Erro ao desativar usuário:', error);
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
router.post('/:id/reset-password', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🔑 [USERS/RESET-PASSWORD] Resetando senha do usuário:', id);

    const reset = await usersService.resetPassword(id);

    if (!reset) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    console.log('✅ [USERS/RESET-PASSWORD] Senha resetada com sucesso');

    return res.json({
      success: true,
      message: 'Senha resetada com sucesso'
    });
  } catch (error: any) {
    console.log('❌ [USERS/RESET-PASSWORD] Erro ao resetar senha:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/role/{roleId}:
 *   get:
 *     summary: Get users by role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users found
 */
router.get('/role/:roleId', requireAdmin, async (req: any, res) => {
  try {
    const { roleId } = req.params;

    console.log('🔍 [USERS/BY-ROLE] Buscando usuários por role:', roleId);

    const users = await usersService.getUsersByRole(roleId);

    console.log('✅ [USERS/BY-ROLE] Usuários encontrados:', users.length);

    return res.json({
      success: true,
      data: users,
      message: 'Usuários encontrados com sucesso'
    });
  } catch (error: any) {
    console.log('❌ [USERS/BY-ROLE] Erro ao buscar usuários por role:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/users/institution/{institutionId}:
 *   get:
 *     summary: Get users by institution
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users found
 */
router.get('/institution/:institutionId', requireAdmin, async (req: any, res) => {
  try {
    const { institutionId } = req.params;

    console.log('🔍 [USERS/BY-INSTITUTION] Buscando usuários por instituição:', institutionId);

    const users = await usersService.getUsersByInstitution(institutionId);

    console.log('✅ [USERS/BY-INSTITUTION] Usuários encontrados:', users.length);

    return res.json({
      success: true,
      data: users,
      message: 'Usuários encontrados com sucesso'
    });
  } catch (error: any) {
    console.log('❌ [USERS/BY-INSTITUTION] Erro ao buscar usuários por instituição:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;

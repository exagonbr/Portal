import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole, validateJWTSmart, requireRoleSmart } from '../middleware/auth';
import { validateTokenUltraSimple } from '../middleware/sessionMiddleware';
import { UserRepository } from '../repositories/UserRepository';
import bcrypt from 'bcryptjs';

const router = express.Router();
const userRepository = new UserRepository();

// Rota de teste sem middleware para debug - MOVIDA PARA O INÍCIO
router.get('/stats-test', async (req, res) => {
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
 *                     totalUsers:
 *                       type: number
 *                     users_by_role:
 *                       type: object
 *                     activeUsers:
 *                       type: number
 *                     inactiveUsers:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/stats', validateTokenUltraSimple, async (req, res) => {
  try {
    console.log('📊 [USERS/STATS] Iniciando...');
    
    // Primeiro, vamos testar com dados estáticos para ver se o problema é na query
    const staticStats = {
      totalUsers: 100,
      activeUsers: 85,
      inactiveUsers: 15,
      users_by_role: {
        'STUDENT': 70,
        'TEACHER': 20,
        'ADMIN': 10
      }
    };
    
    console.log('✅ [USERS/STATS] Retornando dados estáticos para teste');
    
    return res.json({
      success: true,
      data: staticStats,
      message: 'Estatísticas de usuários (dados de teste)',
      debug: 'Usando dados estáticos para identificar problema'
    });
    
    /* CÓDIGO ORIGINAL COMENTADO PARA DEBUG:
    
    console.log('📊 Iniciando busca de estatísticas de usuários...');
    
    // Buscar estatísticas básicas de usuários
    let totalUsers = 0;
    let activeUsers = 0;
    let inactiveUsers = 0;
    let usersByRole = {};
    
    try {
      totalUsers = await userRepository.count();
      console.log('✅ Total de usuários:', totalUsers);
    } catch (error) {
      console.error('❌ Erro ao buscar total de usuários:', error);
    }
    
    try {
      activeUsers = await userRepository.count({ is_active: true });
      inactiveUsers = totalUsers - activeUsers;
      console.log('✅ Usuários ativos:', activeUsers, 'Inativos:', inactiveUsers);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários ativos:', error);
    }
    
    // Buscar usuários por role com fallback
    try {
      usersByRole = await userRepository.getUserStatsByRole();
      console.log('✅ Usuários por role:', usersByRole);
    } catch (error) {
      console.error('❌ Erro ao buscar usuários por role:', error);
      // Fallback: contar usuários sem join com roles
      try {
        const db = require('../config/database').default;
        const roleStats = await db('users')
          .select('role_id')
          .count('id as count')
          .where('is_active', true)
          .groupBy('role_id');
        
        usersByRole = {};
        roleStats.forEach((row: any) => {
          const roleId = row.role_id || 'sem_role';
          usersByRole[roleId] = parseInt(row.count, 10) || 0;
        });
        console.log('✅ Fallback - Usuários por role_id:', usersByRole);
      } catch (fallbackError) {
        console.error('❌ Erro no fallback de usuários por role:', fallbackError);
        usersByRole = {
          'STUDENT': Math.floor(totalUsers * 0.7),
          'TEACHER': Math.floor(totalUsers * 0.2),
          'ADMIN': Math.floor(totalUsers * 0.1)
        };
        console.log('✅ Usando dados simulados:', usersByRole);
      }
    }
    
    // Formatar resposta
    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      users_by_role: usersByRole
    };

    console.log('✅ Estatísticas finais:', stats);

    return res.json({
      success: true,
      data: stats,
      message: 'Estatísticas de usuários obtidas com sucesso'
    });
    
    */
    
  } catch (error: any) {
    console.error('❌ [USERS/STATS] Erro geral:', error);
    console.error('❌ [USERS/STATS] Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: 'Erro capturado no catch principal'
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: institution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter users by institution ID
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, teacher, student]
 *         description: Filter users by role
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', validateJWTSmart, requireRoleSmart(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { institution_id, role } = req.query;
    
    let users;
    
    if (institution_id || role) {
      // Filtrar por parâmetros específicos
      const filters: any = {};
      if (institution_id) filters.institution_id = institution_id;
      if (role) {
        // Buscar role_id pelo nome da role (seria necessário um join ou busca prévia)
        // Por simplicidade, assumindo que role é o role_id
        filters.role_id = role;
      }
      users = await userRepository.findUsersWithoutPassword(filters);
    } else {
      // Buscar todos os usuários com informações de role e instituição
      users = await userRepository.getUsersWithRoleAndInstitution();
    }

    res.json({
      success: true,
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', validateJWTSmart, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const user = await userRepository.getUserWithRoleAndInstitution(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 */
router.put('/me', validateJWTSmart, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const { name, password, endereco, telefone } = req.body;

    // Verificar se o usuário existe
    const existingUser = await userRepository.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Preparar dados para atualização (usuário só pode alterar dados pessoais)
    const updateData: any = {};
    if (name) updateData.name = name;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (telefone !== undefined) updateData.telefone = telefone;

    // Hash da nova senha se fornecida
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres'
        });
      }
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Atualizar usuário
    await userRepository.updateUser(userId, updateData);
    
    // Buscar usuário atualizado com informações de role e instituição
    const updatedUser = await userRepository.getUserWithRoleAndInstitution(userId);

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
 *           format: uuid
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
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
    
    const user = await userRepository.getUserWithRoleAndInstitution(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
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
 *               - name
 *               - role
 *               - institution_id
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 */
router.post('/', authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { email, password, name, role_id, institution_id, endereco, telefone, cpf, birth_date } = req.body;

    // Validar campos obrigatórios
    if (!email || !password || !name || !role_id || !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: email, password, name, role_id, institution_id'
      });
    }

    // Verificar se o email já existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar usuário - filtrar apenas campos que existem na tabela
    const baseUserData = {
      email,
      password: hashedPassword,
      name,
      role_id,
      institution_id,
      endereco,
      telefone,
      is_active: true
    };

    // Adicionar campos opcionais apenas se fornecidos
    const optionalFields: any = {};
          if (cpf) optionalFields.cpf = cpf;
      if (birth_date) optionalFields.birth_date = birth_date;

    const userData = { ...baseUserData, ...optionalFields };

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

    const newUser = await userRepository.createUser(userData);
    
    // Buscar usuário criado com informações de role e instituição
    const userWithDetails = await userRepository.getUserWithRoleAndInstitution(newUser.id);

    return res.status(201).json({
      success: true,
      data: userWithDetails,
      message: 'Usuário criado com sucesso'
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    
    // Tratar erros específicos do banco de dados
    if (error.code === '42703') {
      return res.status(400).json({
        success: false,
        message: 'Campo não existe na tabela de usuários'
      });
    }
    
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
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
 *           format: uuid
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
 *               name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, student]
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: User updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/:id', authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'INSTITUTION_MANAGER', 'manager']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role_id, institution_id, endereco, telefone, password, cpf, birth_date } = req.body;

    // Verificar se o usuário existe
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }
    
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailInUse = await userRepository.findByEmail(email);
      if (emailInUse) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role_id) updateData.role_id = role_id;
    if (institution_id) updateData.institution_id = institution_id;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (telefone !== undefined) updateData.telefone = telefone;
    
    
    if (cpf !== undefined) updateData.cpf = cpf;
          if (birth_date !== undefined) updateData.birth_date = birth_date;

    // Hash da nova senha se fornecida
    if (password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Atualizar usuário
    await userRepository.updateUser(id, updateData);
    
    // Buscar usuário atualizado com informações de role e instituição
    const updatedUser = await userRepository.getUserWithRoleAndInstitution(id);

    return res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', authMiddleware, requireRole(['admin', 'SYSTEM_ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o usuário existe
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID do usuário é obrigatório'
      });
    }
    
    const existingUser = await userRepository.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Não permitir que o admin delete a si mesmo
    if (req.user?.userId === id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar seu próprio usuário'
      });
    }

    // Deletar usuário
    const deleted = await userRepository.deleteUser(id);
    
    if (!deleted) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar usuário'
      });
    }

    return res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;


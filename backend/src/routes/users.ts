import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import db from '../config/database';
import bcrypt from 'bcrypt';

const router = express.Router();

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
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role
 *       - in: query
 *         name: institution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by institution
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { role, institution_id, page = 1, limit = 20 } = req.query;
    const userInstitutionId = req.user?.institutionId;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institutions', 'users.institution_id', 'institutions.id')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'institutions.name as institution_name'
      ])
      .where('users.is_active', true);

    // Filtrar por instituição do usuário se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('users.institution_id', userInstitutionId);
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
      data: users,
      total,
      page: Number(page),
      totalPages
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
router.get('/me', validateJWT, async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    const user = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institutions', 'users.institution_id', 'institutions.id')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.phone',
        'users.profile_picture',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'institutions.name as institution_name'
      ])
      .where('users.id', userId)
      .first();
    
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
router.put('/me', validateJWT, async (req, res) => {
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
    const existingUser = await db('users').where('id', userId).first();
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Preparar dados para atualização (usuário só pode alterar dados pessoais)
    const updateData: any = {
      updated_at: new Date()
    };
    if (name) updateData.name = name;
    if (endereco !== undefined) updateData.endereco = endereco;
    if (telefone !== undefined) updateData.phone = telefone;

    // Hash da nova senha se fornecida
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 8 caracteres'
        });
      }
      const saltRounds = 10;
      updateData.password_hash = await bcrypt.hash(password, saltRounds);
    }

    // Atualizar usuário
    await db('users').where('id', userId).update(updateData);
    
    // Buscar usuário atualizado com informações de role e instituição
    const updatedUser = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institutions', 'users.institution_id', 'institutions.id')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.phone',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'institutions.name as institution_name'
      ])
      .where('users.id', userId)
      .first();

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
 *       404:
 *         description: User not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    const user = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institutions', 'users.institution_id', 'institutions.id')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.phone',
        'users.profile_picture',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'institutions.name as institution_name'
      ])
      .where('users.id', id)
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissões de acesso
    if (userInstitutionId && user.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
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
 *               - name
 *               - email
 *               - password
 *               - role_id
 *               - institution_id
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               phone:
 *                 type: string
 *               role_id:
 *                 type: string
 *                 format: uuid
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role_id,
      institution_id,
      profile_picture
    } = req.body;

    const userInstitutionId = req.user?.institutionId;

    // Validar campos obrigatórios
    if (!name || !email || !password || !role_id || !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: name, email, password, role_id, institution_id'
      });
    }

    // Verificar se pode criar usuário nesta instituição
    if (userInstitutionId && institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode criar usuários em sua própria instituição'
      });
    }

    // Verificar se email já existe
    const existingUser = await db('users').where('email', email).first();
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password_hash: hashedPassword,
      phone,
      role_id,
      institution_id,
      profile_picture,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newUser] = await db('users').insert(userData).returning(['id', 'name', 'email', 'is_active', 'created_at']);

    return res.status(201).json({
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 */
router.put('/:id', validateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    // Verificar se usuário existe
    const existingUser = await db('users').where('id', id).first();

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissões
    if (userInstitutionId && existingUser.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este usuário'
      });
    }

    const {
      name,
      email,
      phone,
      profile_picture,
      is_active
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (profile_picture !== undefined) updateData.profile_picture = profile_picture;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Verificar se novo email já existe (se alterado)
    if (email && email !== existingUser.email) {
      const emailExists = await db('users').where('email', email).first();
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    await db('users').where('id', id).update(updateData);

    const updatedUser = await db('users')
      .leftJoin('roles', 'users.role_id', 'roles.id')
      .leftJoin('institutions', 'users.institution_id', 'institutions.id')
      .select([
        'users.id',
        'users.name',
        'users.email',
        'users.phone',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'institutions.name as institution_name'
      ])
      .where('users.id', id)
      .first();

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
router.delete('/:id', validateJWT, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await db('users').where('id', id).first();

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Soft delete: marcar como inativo
    await db('users')
      .where('id', id)
      .update({
        is_active: false,
        updated_at: new Date()
      });

    return res.json({
      success: true,
      message: 'Usuário removido com sucesso'
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


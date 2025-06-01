import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course ID
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
 *         description: List of modules
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { course, page = 1, limit = 20 } = req.query;
    const userInstitutionId = req.user?.institutionId;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('modules')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'modules.*',
        'courses.title as course_title',
        'institutions.name as institution_name'
      ])
      .where('modules.status', 'active');

    // Filtrar por instituição do usuário se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('courses.institution_id', userInstitutionId);
    }

    // Aplicar filtros
    if (course) {
      query = query.where('modules.course_id', course);
    }

    // Contar total
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = Number(count);

    // Aplicar paginação
    const modules = await query
      .orderBy('courses.title')
      .orderBy('modules.order_index')
      .limit(Number(limit))
      .offset(offset);

    const totalPages = Math.ceil(total / Number(limit));

    return res.json({
      success: true,
      data: modules,
      total,
      page: Number(page),
      totalPages
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/modules/{id}:
 *   get:
 *     summary: Get module by ID
 *     tags: [Modules]
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
 *         description: Module found
 *       404:
 *         description: Module not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    const module = await db('modules')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'modules.*',
        'courses.title as course_title',
        'courses.teacher_id',
        'institutions.name as institution_name'
      ])
      .where('modules.id', id)
      .first();

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar permissões de acesso
    if (userInstitutionId && module.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar conteúdo do módulo
    const content = await db('content')
      .where('module_id', id)
      .where('status', 'active')
      .orderBy('order_index');

    module.content = content;

    return res.json({
      success: true,
      data: module
    });
  } catch (error) {
    console.error('Error fetching module:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - course_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               course_id:
 *                 type: string
 *                 format: uuid
 *               objectives:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module created
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const {
      title,
      description,
      course_id,
      objectives,
      order_index
    } = req.body;

    const userInstitutionId = req.user?.institutionId;

    // Validar campos obrigatórios
    if (!title || !course_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, course_id'
      });
    }

    // Verificar se o curso existe e se o usuário tem acesso
    const course = await db('courses')
      .select(['id', 'title', 'institution_id', 'teacher_id'])
      .where('id', course_id)
      .first();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = course.teacher_id === req.user?.userId;
    const sameInstitution = course.institution_id === userInstitutionId;

    if (!isAdmin && (!isTeacher || !sameInstitution)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para criar módulos neste curso'
      });
    }

    // Determinar order_index se não fornecido
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const lastModule = await db('modules')
        .where('course_id', course_id)
        .orderBy('order_index', 'desc')
        .first();
      finalOrderIndex = lastModule ? lastModule.order_index + 1 : 1;
    }

    const moduleData = {
      title,
      description,
      course_id,
      objectives,
      order_index: finalOrderIndex,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newModule] = await db('modules').insert(moduleData).returning('*');

    return res.status(201).json({
      success: true,
      data: newModule,
      message: 'Módulo criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating module:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/modules/{id}:
 *   put:
 *     summary: Update a module
 *     tags: [Modules]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               objectives:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Module updated
 *       404:
 *         description: Module not found
 */
router.put('/:id', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    // Verificar se o módulo existe
    const existingModule = await db('modules')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'modules.*',
        'courses.institution_id',
        'courses.teacher_id'
      ])
      .where('modules.id', id)
      .first();

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = existingModule.teacher_id === req.user?.userId;
    const sameInstitution = existingModule.institution_id === userInstitutionId;

    if (!isAdmin && (!isTeacher || !sameInstitution)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este módulo'
      });
    }

    const {
      title,
      description,
      objectives,
      order_index,
      status
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (objectives !== undefined) updateData.objectives = objectives;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (status !== undefined) updateData.status = status;

    await db('modules').where('id', id).update(updateData);

    const updatedModule = await db('modules')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .select([
        'modules.*',
        'courses.title as course_title'
      ])
      .where('modules.id', id)
      .first();

    return res.json({
      success: true,
      data: updatedModule,
      message: 'Módulo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating module:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/modules/{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Modules]
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
 *         description: Module deleted
 *       404:
 *         description: Module not found
 */
router.delete('/:id', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  try {
    const { id } = req.params;

    const existingModule = await db('modules')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'modules.*',
        'courses.teacher_id'
      ])
      .where('modules.id', id)
      .first();

    if (!existingModule) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = existingModule.teacher_id === req.user?.userId;

    if (!isAdmin && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este módulo'
      });
    }

    // Soft delete: marcar como inativo
    await db('modules')
      .where('id', id)
      .update({
        status: 'inactive',
        updated_at: new Date()
      });

    return res.json({
      success: true,
      message: 'Módulo removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting module:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/modules/{id}/content:
 *   get:
 *     summary: Get all content for a module
 *     tags: [Modules, Content]
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
 *         description: List of content
 *       404:
 *         description: Module not found
 */
router.get('/:id/content', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o módulo existe
    const module = await db('modules')
      .join('courses', 'modules.course_id', 'courses.id')
      .select(['modules.id', 'courses.institution_id'])
      .where('modules.id', id)
      .first();

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    const content = await db('content')
      .where('module_id', id)
      .where('status', 'active')
      .orderBy('order_index');

    return res.json({
      success: true,
      data: content,
      total: content.length
    });
  } catch (error) {
    console.error('Error fetching module content:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

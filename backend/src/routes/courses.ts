import express from 'express';
import { validateJWT, requireRole, requireInstitution } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: institution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter courses by institution ID
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter courses by teacher ID
 *       - in: query
 *         name: student
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter courses by student ID
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { institution_id, teacher, student } = req.query;
    const userInstitutionId = req.user?.institutionId;

    let query = db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'courses.*',
        'teachers.name as teacher_name',
        'teachers.email as teacher_email',
        'institutions.name as institution_name'
      ])
      .where('courses.status', '!=', 'archived');

    // Filtrar por instituição do usuário se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('courses.institution_id', userInstitutionId);
    }

    // Aplicar filtros
    if (institution_id) {
      query = query.where('courses.institution_id', institution_id);
    }

    if (teacher) {
      query = query.where('courses.teacher_id', teacher);
    }

    if (student) {
      // Para filtro por estudante, precisaria de uma tabela de relacionamento
      // Por enquanto, retornamos todos os cursos disponíveis
    }

    const courses = await query;

    res.json({
      success: true,
      data: courses,
      total: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
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
 *         description: Course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    let query = db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'courses.*',
        'teachers.name as teacher_name',
        'teachers.email as teacher_email',
        'institutions.name as institution_name'
      ])
      .where('courses.id', id)
      .first();

    const course = await query;

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }

    // Verificar se o usuário tem acesso ao curso
    if (userInstitutionId && course.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Buscar módulos do curso
    const modules = await db('modules')
      .where('course_id', id)
      .where('status', 'active')
      .orderBy('order_index');

    course.modules = modules;

    return res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
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
 *               - description
 *               - institution_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *               code:
 *                 type: string
 *               objectives:
 *                 type: string
 *               duration_hours:
 *                 type: integer
 *               difficulty_level:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR', 'TEACHER']), async (req, res) => {
  try {
    const {
      title,
      code,
      description,
      objectives,
      duration_hours,
      difficulty_level,
      category,
      thumbnail_url,
      institution_id
    } = req.body;

    const userId = req.user?.userId;
    const userInstitutionId = req.user?.institutionId;

    // Validar campos obrigatórios
    if (!title || !description || !institution_id) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, description, institution_id'
      });
    }

    // Verificar se o usuário pode criar curso nesta instituição
    if (userInstitutionId && institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Você só pode criar cursos em sua própria instituição'
      });
    }

    // Gerar código automático se não fornecido
    const courseCode = code || `CURSO_${Date.now()}`;

    // Verificar se o código já existe na instituição
    const existingCourse = await db('courses')
      .where('code', courseCode)
      .where('institution_id', institution_id)
      .first();

    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Código do curso já existe nesta instituição'
      });
    }

    const courseData = {
      title,
      code: courseCode,
      description,
      objectives,
      duration_hours,
      difficulty_level,
      category,
      thumbnail_url,
      teacher_id: userId,
      institution_id,
      status: 'draft',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newCourse] = await db('courses').insert(courseData).returning('*');

    return res.status(201).json({
      success: true,
      data: newCourse,
      message: 'Curso criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *               duration_hours:
 *                 type: integer
 *               difficulty_level:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: Course updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.put('/:id', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR', 'TEACHER']), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userInstitutionId = req.user?.institutionId;

    // Verificar se o curso existe
    const existingCourse = await db('courses').where('id', id).first();

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = existingCourse.teacher_id === userId;
    const sameInstitution = existingCourse.institution_id === userInstitutionId;

    if (!isAdmin && (!isTeacher || !sameInstitution)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este curso'
      });
    }

    const {
      title,
      description,
      objectives,
      duration_hours,
      difficulty_level,
      category,
      thumbnail_url,
      status
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (objectives !== undefined) updateData.objectives = objectives;
    if (duration_hours !== undefined) updateData.duration_hours = duration_hours;
    if (difficulty_level !== undefined) updateData.difficulty_level = difficulty_level;
    if (category !== undefined) updateData.category = category;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (status !== undefined) updateData.status = status;

    await db('courses').where('id', id).update(updateData);

    const updatedCourse = await db('courses')
      .leftJoin('users as teachers', 'courses.teacher_id', 'teachers.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'courses.*',
        'teachers.name as teacher_name',
        'institutions.name as institution_name'
      ])
      .where('courses.id', id)
      .first();

    return res.json({
      success: true,
      data: updatedCourse,
      message: 'Curso atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
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
 *         description: Course deleted
 *       404:
 *         description: Course not found
 */
router.delete('/:id', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']), async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await db('courses').where('id', id).first();

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }

    // Soft delete: marcar como arquivado ao invés de deletar
    await db('courses')
      .where('id', id)
      .update({
        status: 'archived',
        updated_at: new Date()
      });

    return res.json({
      success: true,
      message: 'Curso removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}/modules:
 *   get:
 *     summary: Get all modules for a course
 *     tags: [Courses, Modules]
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
 *         description: List of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       404:
 *         description: Course not found
 */
router.get('/:id/modules', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o curso existe
    const course = await db('courses').where('id', id).first();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso não encontrado'
      });
    }

    const modules = await db('modules')
      .where('course_id', id)
      .where('status', 'active')
      .orderBy('order_index');

    // Para cada módulo, buscar o conteúdo
    for (const module of modules) {
      const content = await db('content')
        .where('module_id', module.id)
        .where('status', 'active')
        .orderBy('order_index');
      module.content = content;
    }

    return res.json({
      success: true,
      data: modules,
      total: modules.length
    });
  } catch (error) {
    console.error('Error fetching course modules:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/courses/{id}/books:
 *   get:
 *     summary: Get all books for a course
 *     tags: [Courses, Books]
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
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Course not found
 */
router.get('/:id/books', validateJWT, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  return res.status(501).json({
    success: false,
    message: 'Funcionalidade não implementada'
  });
});

/**
 * @swagger
 * /api/courses/{id}/videos:
 *   get:
 *     summary: Get all videos for a course
 *     tags: [Courses, Videos]
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
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       404:
 *         description: Course not found
 */
router.get('/:id/videos', validateJWT, requireInstitution, async (req, res) => {
  // Implementation will be added in the controller
  return res.status(501).json({
    success: false,
    message: 'Funcionalidade não implementada'
  });
});

export default router;

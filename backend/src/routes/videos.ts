import express from 'express';
import { validateJWT, requireRole } from '../middleware/auth';
import db from '../config/database';

const router = express.Router();

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by module ID
 *       - in: query
 *         name: course
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by course ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by title or description
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
 *         description: List of videos
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { module, course, search, page = 1, limit = 20 } = req.query;
    const userInstitutionId = req.user?.institutionId;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('content')
      .leftJoin('modules', 'content.module_id', 'modules.id')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'content.id',
        'content.title',
        'content.description',
        'content.video_url',
        'content.duration',
        'content.thumbnail_url',
        'content.order_index',
        'content.created_at',
        'modules.title as module_title',
        'courses.title as course_title',
        'institutions.name as institution_name'
      ])
      .where('content.type', 'video')
      .where('content.status', 'active');

    // Filtrar por instituição do usuário se não for admin
    if (userInstitutionId && req.user?.role !== 'admin') {
      query = query.where('courses.institution_id', userInstitutionId);
    }

    // Aplicar filtros
    if (module) {
      query = query.where('content.module_id', module);
    }

    if (course) {
      query = query.where('courses.id', course);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where(function() {
        this.where('content.title', 'ilike', searchTerm)
          .orWhere('content.description', 'ilike', searchTerm);
      });
    }

    // Contar total
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = Number(count);

    // Aplicar paginação
    const videos = await query
      .orderBy('courses.title')
      .orderBy('modules.order_index')
      .orderBy('content.order_index')
      .limit(Number(limit))
      .offset(offset);

    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: videos,
      total,
      page: Number(page),
      totalPages
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get video by ID
 *     tags: [Videos]
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
 *         description: Video found
 *       404:
 *         description: Video not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    const video = await db('content')
      .leftJoin('modules', 'content.module_id', 'modules.id')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .select([
        'content.*',
        'modules.title as module_title',
        'modules.id as module_id',
        'courses.title as course_title',
        'courses.id as course_id',
        'institutions.name as institution_name'
      ])
      .where('content.id', id)
      .where('content.type', 'video')
      .first();

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado'
      });
    }

    // Verificar permissões de acesso
    if (userInstitutionId && video.institution_id !== userInstitutionId && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    return res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
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
 *               - module_id
 *               - video_url
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               module_id:
 *                 type: string
 *                 format: uuid
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *               order_index:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Video created
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR', 'TEACHER']), async (req, res) => {
  try {
    const {
      title,
      description,
      module_id,
      video_url,
      duration,
      thumbnail_url,
      order_index
    } = req.body;

    const userInstitutionId = req.user?.institutionId;

    // Validar campos obrigatórios
    if (!title || !module_id || !video_url) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: title, module_id, video_url'
      });
    }

    // Verificar se o módulo existe e se o usuário tem acesso
    const module = await db('modules')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'modules.id',
        'modules.title',
        'courses.institution_id',
        'courses.teacher_id'
      ])
      .where('modules.id', module_id)
      .first();

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = module.teacher_id === req.user?.userId;
    const sameInstitution = module.institution_id === userInstitutionId;

    if (!isAdmin && (!isTeacher || !sameInstitution)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para criar vídeos neste módulo'
      });
    }

    // Determinar order_index se não fornecido
    let finalOrderIndex = order_index;
    if (!finalOrderIndex) {
      const lastContent = await db('content')
        .where('module_id', module_id)
        .orderBy('order_index', 'desc')
        .first();
      finalOrderIndex = lastContent ? lastContent.order_index + 1 : 1;
    }

    const videoData = {
      title,
      description,
      module_id,
      type: 'video',
      video_url,
      duration,
      thumbnail_url,
      order_index: finalOrderIndex,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [newVideo] = await db('content').insert(videoData).returning('*');

    return res.status(201).json({
      success: true,
      data: newVideo,
      message: 'Vídeo criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating video:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
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
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               thumbnail_url:
 *                 type: string
 *               order_index:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Video updated
 *       404:
 *         description: Video not found
 */
router.put('/:id', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR', 'TEACHER']), async (req, res) => {
  try {
    const { id } = req.params;
    const userInstitutionId = req.user?.institutionId;

    // Verificar se o vídeo existe
    const existingVideo = await db('content')
      .join('modules', 'content.module_id', 'modules.id')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'content.*',
        'courses.institution_id',
        'courses.teacher_id'
      ])
      .where('content.id', id)
      .where('content.type', 'video')
      .first();

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = existingVideo.teacher_id === req.user?.userId;
    const sameInstitution = existingVideo.institution_id === userInstitutionId;

    if (!isAdmin && (!isTeacher || !sameInstitution)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para editar este vídeo'
      });
    }

    const {
      title,
      description,
      video_url,
      duration,
      thumbnail_url,
      order_index,
      status
    } = req.body;

    const updateData: any = {
      updated_at: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (video_url !== undefined) updateData.video_url = video_url;
    if (duration !== undefined) updateData.duration = duration;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (order_index !== undefined) updateData.order_index = order_index;
    if (status !== undefined) updateData.status = status;

    await db('content').where('id', id).update(updateData);

    const updatedVideo = await db('content')
      .leftJoin('modules', 'content.module_id', 'modules.id')
      .leftJoin('courses', 'modules.course_id', 'courses.id')
      .select([
        'content.*',
        'modules.title as module_title',
        'courses.title as course_title'
      ])
      .where('content.id', id)
      .first();

    return res.json({
      success: true,
      data: updatedVideo,
      message: 'Vídeo atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
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
 *         description: Video deleted
 *       404:
 *         description: Video not found
 */
router.delete('/:id', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR']), async (req, res) => {
  try {
    const { id } = req.params;

    const existingVideo = await db('content')
      .join('modules', 'content.module_id', 'modules.id')
      .join('courses', 'modules.course_id', 'courses.id')
      .select([
        'content.*',
        'courses.teacher_id'
      ])
      .where('content.id', id)
      .where('content.type', 'video')
      .first();

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado'
      });
    }

    // Verificar permissões
    const isAdmin = req.user?.role === 'admin';
    const isTeacher = existingVideo.teacher_id === req.user?.userId;

    if (!isAdmin && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para deletar este vídeo'
      });
    }

    // Soft delete: marcar como inativo
    await db('content')
      .where('id', id)
      .update({
        status: 'inactive',
        updated_at: new Date()
      });

    return res.json({
      success: true,
      message: 'Vídeo removido com sucesso'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     summary: Upload a video file
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.post('/upload', validateJWT, requireRole(['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'ACADEMIC_COORDINATOR', 'TEACHER']), async (req, res) => {
  // Upload implementation would go here
  return res.status(501).json({
    success: false,
    message: 'Upload não implementado ainda'
  });
});

/**
 * @swagger
 * /api/videos/stream/{id}:
 *   get:
 *     summary: Stream video content
 *     tags: [Videos]
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
 *         description: Video stream
 *       404:
 *         description: Video not found
 */
router.get('/stream/:id', validateJWT, async (req, res) => {
  // Streaming implementation would go here
  return res.status(501).json({
    success: false,
    message: 'Streaming não implementado ainda'
  });
});

/**
 * @swagger
 * /api/videos/{id}/thumbnail:
 *   get:
 *     summary: Get video thumbnail
 *     tags: [Videos]
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
 *         description: Video thumbnail
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video or thumbnail not found
 */
router.get('/:id/thumbnail', validateJWT, async (req, res) => {
  // Thumbnail implementation would go here
  return res.status(501).json({
    success: false,
    message: 'Thumbnail não implementado ainda'
  });
});

export default router;

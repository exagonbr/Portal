import { Router, Request, Response } from 'express';
import { CertificateCreateRequest, CertificateUpdateRequest } from '../models/Certificate';
import { requireAuth } from '../middleware/requireAuth';
import { db } from '../database/connection';

const router = Router();

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores e professores podem gerenciar certificados'
    });
  }
  
  next();
};

// GET /api/certificates - Listar certificados com filtros e paginação (PROTEGIDO)
router.get('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    
    const {
      page = 1,
      limit = 10,
      user_id,
      tv_show_id,
      score,
      document,
      license_code,
      tv_show_name,
      recreate,
      search,
      sort_by = 'date_created',
      sort_order = 'desc'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    // Construir WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (user_id) {
      whereConditions.push(`user_id = $${paramIndex++}`);
      queryParams.push(Number(user_id));
    }

    if (tv_show_id) {
      whereConditions.push(`tv_show_id = $${paramIndex++}`);
      queryParams.push(Number(tv_show_id));
    }

    if (score) {
      whereConditions.push(`score = $${paramIndex++}`);
      queryParams.push(Number(score));
    }

    if (document) {
      whereConditions.push(`document ILIKE $${paramIndex++}`);
      queryParams.push(`%${document}%`);
    }

    if (license_code) {
      whereConditions.push(`license_code ILIKE $${paramIndex++}`);
      queryParams.push(`%${license_code}%`);
    }

    if (tv_show_name) {
      whereConditions.push(`tv_show_name ILIKE $${paramIndex++}`);
      queryParams.push(`%${tv_show_name}%`);
    }

    if (recreate !== undefined) {
      whereConditions.push(`recreate = $${paramIndex++}`);
      queryParams.push(recreate === 'true');
    }

    if (search) {
      whereConditions.push(`(
        document ILIKE $${paramIndex} OR 
        license_code ILIKE $${paramIndex} OR 
        tv_show_name ILIKE $${paramIndex} OR
        path ILIKE $${paramIndex}
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Validar sort_by
    const validSortFields = ['date_created', 'last_updated', 'score', 'tv_show_name'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by : 'date_created';
    const sortDirection = sort_order === 'asc' ? 'ASC' : 'DESC';

    // Construir query usando Knex
    let query = db('certificate').select('*');
    
    // Aplicar filtros
    if (user_id) {
      query = query.where('user_id', Number(user_id));
    }
    if (tv_show_id) {
      query = query.where('tv_show_id', Number(tv_show_id));
    }
    if (score) {
      query = query.where('score', Number(score));
    }
    if (document) {
      query = query.where('document', 'ilike', `%${document}%`);
    }
    if (license_code) {
      query = query.where('license_code', 'ilike', `%${license_code}%`);
    }
    if (tv_show_name) {
      query = query.where('tv_show_name', 'ilike', `%${tv_show_name}%`);
    }
    if (recreate !== undefined) {
      query = query.where('recreate', recreate === 'true');
    }
    if (search) {
      query = query.where(function() {
        this.where('document', 'ilike', `%${search}%`)
          .orWhere('license_code', 'ilike', `%${search}%`)
          .orWhere('tv_show_name', 'ilike', `%${search}%`)
          .orWhere('path', 'ilike', `%${search}%`);
      });
    }

    // Contar total
    const countResult = await query.clone().count('* as total');
    const total = parseInt(countResult[0].total as string);

    // Buscar dados com paginação e ordenação
    const dataResult = await query
      .orderBy(sortField as string, sortDirection.toLowerCase() as 'asc' | 'desc')
      .limit(Number(limit))
      .offset(offset);
    
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: dataResult,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages
      }
    });

  } catch (error) {
    console.log('Erro ao buscar certificados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/search - Buscar certificados para validação pública (SEM AUTENTICAÇÃO)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { license_code, cpf_last_digits } = req.query;

    if (!license_code && !cpf_last_digits) {
      return res.status(400).json({
        success: false,
        message: 'É necessário informar o número da licença ou os últimos 3 dígitos do CPF'
      });
    }

    // Validar formato dos últimos dígitos do CPF
    if (cpf_last_digits && !/^\d{3}$/.test(cpf_last_digits as string)) {
      return res.status(400).json({
        success: false,
        message: 'Os últimos dígitos do CPF devem conter exatamente 3 números'
      });
    }

    // Construir query usando Knex
    let query = db('certificate as c')
      .select(
        'c.id',
        'c.date_created',
        'c.score',
        'c.license_code',
        'c.tv_show_name',
        db.raw("CONCAT(LEFT(c.document, 3), '.***.***-**') as document_masked")
      )
      .orderBy('c.date_created', 'desc')
      .limit(10);

    if (license_code) {
      query = query.where('c.license_code', license_code as string);
    }

    if (cpf_last_digits) {
      // Buscar por últimos 3 dígitos do CPF no campo document
      query = query.whereRaw(`RIGHT(REGEXP_REPLACE(c.document, '[^0-9]', '', 'g'), 3) = ?`, [cpf_last_digits]);
    }

    const result = await query;

    return res.json({
      success: true,
      data: result,
      message: result.length > 0 ? 'Certificados encontrados' : 'Nenhum certificado encontrado'
    });

  } catch (error) {
    console.log('Erro ao buscar certificados públicos:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/certificates - Criar certificado (PROTEGIDO)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const data: CertificateCreateRequest = req.body;

    // Validações básicas
    if (!data.user_id || !data.tv_show_id || !data.score) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: user_id, tv_show_id, score'
      });
    }

    // Gerar license_code único se não fornecido
    if (!data.license_code) {
      data.license_code = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }

    const result = await db('certificate')
      .insert({
        user_id: data.user_id,
        tv_show_id: data.tv_show_id,
        score: data.score,
        document: data.document || '',
        license_code: data.license_code,
        tv_show_name: data.tv_show_name || '',
        path: data.path || '',
        recreate: data.recreate || false,
        date_created: db.fn.now(),
        last_updated: db.fn.now(),
        version: 1
      })
      .returning('*');

    return res.status(201).json({
      success: true,
      data: result[0],
      message: 'Certificado criado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao criar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/:id - Buscar certificado por ID (PROTEGIDO)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Construir query usando Knex
    let query = db('certificate').where('id', id);

    // Se não é admin, adicionar filtro por user_id
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
      query = query.where('user_id', user.id);
    }

    const result = await query.first();

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.log('Erro ao buscar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/certificates/:id - Atualizar certificado (PROTEGIDO)
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: CertificateUpdateRequest = req.body;

    // Verificar se certificado existe
    const existsResult = await db('certificate').where('id', id).first();
    
    if (!existsResult) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    // Construir objeto de update dinamicamente
    const updateData: any = {};

    if (data.score !== undefined) {
      updateData.score = data.score;
    }

    if (data.document !== undefined) {
      updateData.document = data.document;
    }

    if (data.tv_show_name !== undefined) {
      updateData.tv_show_name = data.tv_show_name;
    }

    if (data.path !== undefined) {
      updateData.path = data.path;
    }

    if (data.recreate !== undefined) {
      updateData.recreate = data.recreate;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar campos automáticos
    updateData.last_updated = db.fn.now();
    updateData.version = db.raw('version + 1');

    const result = await db('certificate')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Certificado atualizado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao atualizar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/certificates/:id - Deletar certificado (PROTEGIDO)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;

    const result = await database.query('DELETE FROM certificate WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    return res.json({
      success: true,
      message: 'Certificado deletado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao deletar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
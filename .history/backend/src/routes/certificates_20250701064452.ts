import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { CertificateCreateRequest, CertificateUpdateRequest } from '../models/Certificate';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

// Assumindo que você tem uma conexão com o banco de dados
// Você deve ajustar isso conforme sua configuração atual
let db: Pool;

// Inicializar conexão com o banco (ajuste conforme sua configuração)
const initDB = () => {
  if (!db) {
    db = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return db;
};

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
    const database = initDB();
    
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

    // Query para contar total
    const countQuery = `SELECT COUNT(*) as total FROM certificate ${whereClause}`;
    const countResult = await database.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query para buscar dados
    const dataQuery = `
      SELECT 
        id,
        version,
        date_created,
        last_updated,
        path,
        score,
        tv_show_id,
        user_id,
        document,
        license_code,
        tv_show_name,
        recreate
      FROM certificate 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    queryParams.push(Number(limit), offset);
    
    const dataResult = await database.query(dataQuery, queryParams);
    
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: dataResult.rows,
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
    const database = initDB();
    
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

    // Construir WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (license_code) {
      whereConditions.push(`c.license_code = $${paramIndex++}`);
      queryParams.push(license_code);
    }

    if (cpf_last_digits) {
      // Buscar por últimos 3 dígitos do CPF no campo document
      whereConditions.push(`RIGHT(REGEXP_REPLACE(c.document, '[^0-9]', '', 'g'), 3) = $${paramIndex++}`);
      queryParams.push(cpf_last_digits);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para buscar certificados com informações do usuário (dados públicos apenas)
    const query = `
      SELECT
        c.id,
        c.date_created,
        c.score,
        c.license_code,
        c.tv_show_name,
        -- Mascarar dados sensíveis
        CONCAT(LEFT(c.document, 3), '.***.***-**') as document_masked
      FROM certificate c
      ${whereClause}
      ORDER BY c.date_created DESC
      LIMIT 10
    `;

    const result = await database.query(query, queryParams);

    return res.json({
      success: true,
      data: result.rows,
      message: result.rows.length > 0 ? 'Certificados encontrados' : 'Nenhum certificado encontrado'
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
    const database = initDB();
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

    const query = `
      INSERT INTO certificate (
        user_id, tv_show_id, score, document, license_code, 
        tv_show_name, path, recreate, date_created, last_updated, version
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), 1
      ) RETURNING *
    `;

    const values = [
      data.user_id,
      data.tv_show_id,
      data.score,
      data.document || '',
      data.license_code,
      data.tv_show_name || '',
      data.path || '',
      data.recreate || false
    ];

    const result = await database.query(query, values);

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Certificado criado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao criar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/:id - Buscar certificado por ID (PROTEGIDO)
router.get('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;
    const user = (req as any).user;

    // Admins podem ver qualquer certificado, usuários normais apenas os próprios
    let query = `
      SELECT * FROM certificate WHERE id = $1
    `;
    
    const queryParams = [id];

    // Se não é admin, adicionar filtro por user_id
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
      query += ` AND user_id = $2`;
      queryParams.push(user.id);
    }

    const result = await database.query(query, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.log('Erro ao buscar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/certificates/:id - Atualizar certificado (PROTEGIDO)
router.put('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;
    const data: CertificateUpdateRequest = req.body;

    // Verificar se certificado existe
    const existsResult = await database.query('SELECT id FROM certificate WHERE id = $1', [id]);
    
    if (existsResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    // Construir query de update dinamicamente
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (data.score !== undefined) {
      updateFields.push(`score = $${paramIndex++}`);
      queryParams.push(data.score);
    }

    if (data.document !== undefined) {
      updateFields.push(`document = $${paramIndex++}`);
      queryParams.push(data.document);
    }

    if (data.tv_show_name !== undefined) {
      updateFields.push(`tv_show_name = $${paramIndex++}`);
      queryParams.push(data.tv_show_name);
    }

    if (data.path !== undefined) {
      updateFields.push(`path = $${paramIndex++}`);
      queryParams.push(data.path);
    }

    if (data.recreate !== undefined) {
      updateFields.push(`recreate = $${paramIndex++}`);
      queryParams.push(data.recreate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    // Adicionar campos automáticos
    updateFields.push(`last_updated = NOW()`);
    updateFields.push(`version = version + 1`);

    // Adicionar ID como último parâmetro
    queryParams.push(id);

    const query = `
      UPDATE certificate 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await database.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Certificado atualizado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao atualizar certificado:', error);
    res.status(500).json({
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

    res.json({
      success: true,
      message: 'Certificado deletado com sucesso'
    });

  } catch (error) {
    console.log('Erro ao deletar certificado:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
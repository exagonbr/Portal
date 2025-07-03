import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { CertificateCreateRequest, CertificateUpdateRequest } from '../models/Certificate';

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

// GET /api/certificates - Listar certificados com filtros e paginação
router.get('/', async (req: Request, res: Response) => {
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
    console.error('Erro ao buscar certificados:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/search - Buscar certificados para validação pública (sem autenticação)
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
      // Buscar por últimos 3 dígitos do CPF (assumindo que o CPF está no campo phone ou será adicionado)
      // Por enquanto, vamos usar uma busca genérica que pode ser ajustada
      whereConditions.push(`RIGHT(REGEXP_REPLACE(u.phone, '[^0-9]', '', 'g'), 3) = $${paramIndex++}`);
      queryParams.push(cpf_last_digits);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para buscar certificados com informações do usuário
    const query = `
      SELECT
        c.id,
        c.date_created,
        c.path,
        c.score,
        c.document,
        c.license_code,
        c.tv_show_name,
        u.id as user_id,
        u.full_name,
        u.email
      FROM certificate c
      LEFT JOIN users u ON c.user_id = u.id
      ${whereClause}
      ORDER BY c.date_created DESC
      LIMIT 50
    `;

    const result = await database.query(query, queryParams);

    // Mapear resultados para incluir informações do usuário
    const certificates = result.rows.map(row => ({
      id: row.id,
      license_code: row.license_code,
      document: row.document,
      tv_show_name: row.tv_show_name,
      score: row.score,
      date_created: row.date_created,
      path: row.path,
      user: {
        id: row.user_id,
        full_name: row.full_name,
        email: row.email
      }
    }));

    return res.json({
      success: true,
      data: certificates,
      message: certificates.length > 0
        ? `${certificates.length} certificado(s) encontrado(s)`
        : 'Nenhum certificado encontrado'
    });

  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/certificates/:id - Buscar certificado por ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;

    const query = `
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
      WHERE id = $1
    `;

    const result = await database.query(query, [Number(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Erro ao buscar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/certificates - Criar novo certificado
router.post('/', async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const {
      user_id,
      tv_show_id,
      path,
      score,
      document,
      license_code,
      tv_show_name,
      recreate = true
    }: CertificateCreateRequest = req.body;

    const query = `
      INSERT INTO certificate (
        date_created,
        user_id,
        tv_show_id,
        path,
        score,
        document,
        license_code,
        tv_show_name,
        recreate
      ) VALUES (
        NOW(),
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *
    `;

    const values = [
      user_id || null,
      tv_show_id || null,
      path || null,
      score || null,
      document || null,
      license_code || null,
      tv_show_name || null,
      recreate
    ];

    const result = await database.query(query, values);

    return res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Certificado criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/certificates/:id - Atualizar certificado
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;
    const {
      path,
      score,
      document,
      license_code,
      tv_show_name,
      recreate
    }: CertificateUpdateRequest = req.body;

    // Verificar se o certificado existe
    const checkQuery = 'SELECT id FROM certificate WHERE id = $1';
    const checkResult = await database.query(checkQuery, [Number(id)]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    // Construir query de update dinamicamente
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (path !== undefined) {
      updateFields.push(`path = $${paramIndex++}`);
      updateValues.push(path);
    }

    if (score !== undefined) {
      updateFields.push(`score = $${paramIndex++}`);
      updateValues.push(score);
    }

    if (document !== undefined) {
      updateFields.push(`document = $${paramIndex++}`);
      updateValues.push(document);
    }

    if (license_code !== undefined) {
      updateFields.push(`license_code = $${paramIndex++}`);
      updateValues.push(license_code);
    }

    if (tv_show_name !== undefined) {
      updateFields.push(`tv_show_name = $${paramIndex++}`);
      updateValues.push(tv_show_name);
    }

    if (recreate !== undefined) {
      updateFields.push(`recreate = $${paramIndex++}`);
      updateValues.push(recreate);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar foi fornecido'
      });
    }

    // Adicionar last_updated
    updateFields.push(`last_updated = NOW()`);
    updateValues.push(Number(id));

    const updateQuery = `
      UPDATE certificate 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await database.query(updateQuery, updateValues);

    return res.json({
      success: true,
      data: result.rows[0],
      message: 'Certificado atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/certificates/:id - Excluir certificado
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const database = initDB();
    const { id } = req.params;

    // Verificar se o certificado existe
    const checkQuery = 'SELECT id FROM certificate WHERE id = $1';
    const checkResult = await database.query(checkQuery, [Number(id)]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificado não encontrado'
      });
    }

    const deleteQuery = 'DELETE FROM certificate WHERE id = $1 RETURNING id';
    const result = await database.query(deleteQuery, [Number(id)]);

    return res.json({
      success: true,
      message: 'Certificado excluído com sucesso',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Erro ao excluir certificado:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
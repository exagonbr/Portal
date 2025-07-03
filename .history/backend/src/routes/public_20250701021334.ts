import { Router } from 'express';
import SystemSettingsService from '../services/SystemSettingsService';
import { Request, Response } from 'express';
import db from '../config/database';

const router = Router();

// Rota para servir configurações públicas do sistema
router.get('/system-settings/public', async (req: Request, res: Response) => {
  try {
    const hasTable = await db.schema.hasTable('system_settings');
    if (!hasTable) {
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    const settings = await SystemSettingsService.getAllSettings(false); // Apenas públicas
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações do sistema.'
    });
  }
});

// Rota duplicada para compatibilidade
router.get('/settings/public', async (req: Request, res: Response) => {
  try {
    const hasTable = await db.schema.hasTable('system_settings');
    if (!hasTable) {
      return res.status(200).json({
        success: true,
        data: {}
      });
    }
    const settings = await SystemSettingsService.getAllSettings(false); // Apenas públicas
    return res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações.'
    });
  }
});

// Rota pública para busca de certificados (validação de licenças)
router.get('/certificates/search', async (req: Request, res: Response) => {
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
    const certificates = result.rows.map((row: any) => ({
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

export default router;
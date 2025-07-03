import { Router } from 'express';
import SystemSettingsService from '../services/SystemSettingsService';
import { Request, Response } from 'express';
import db from '../config/database';
import { Pool } from 'pg';

const router = Router();

// Inicializar conexão com o banco para certificados
let dbPool: Pool;

const initDB = () => {
  if (!dbPool) {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return dbPool;
};

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

export default router;
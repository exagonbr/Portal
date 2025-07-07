import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import DashboardController from '../controllers/DashboardController';

const router = Router();

// Rota para dados do dashboard do sistema (apenas para admins)
router.get('/system', requireAuth, DashboardController.getSystemDashboard);

// Rota pública para dados básicos do dashboard (para testes)
router.get('/system-public', DashboardController.getSystemDashboard);

export default router;
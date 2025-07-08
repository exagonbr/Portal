import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import UnitController from '../controllers/UnitController';

const router = Router();

// Comentado temporariamente para teste - descomente em produção
// router.use(requireAuth);

// Rotas de busca e filtros (devem vir antes das rotas com parâmetros)
router.get('/search', UnitController.search);
router.get('/active', UnitController.getActive);
router.get('/stats', async (req, res) => {
  // Rota para estatísticas das unidades (opcional)
  try {
    const unitRepository = new (require('../repositories/UnitRepository').UnitRepository)();
    const stats = await unitRepository.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error getting unit stats:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Rotas CRUD principais
router.get('/', UnitController.getAll);
router.post('/', UnitController.create);
router.get('/:id', UnitController.getById);
router.put('/:id', UnitController.update);
router.delete('/:id', UnitController.delete);

// Rotas específicas de unidades
router.get('/institution/:institutionId', UnitController.getByInstitution);
router.post('/:id/soft-delete', UnitController.softDelete);
router.post('/:id/toggle-status', UnitController.toggleStatus);

export default router;
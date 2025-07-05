import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import ThemeController from '../controllers/ThemeController';

const router = Router();

router.use(requireAuth);

router.get('/', ThemeController.getAll);
router.post('/', ThemeController.create);
router.get('/:id', ThemeController.getById);
router.put('/:id', ThemeController.update);
router.delete('/:id', ThemeController.delete);
router.patch('/:id/status', ThemeController.toggleStatus);

export default router;
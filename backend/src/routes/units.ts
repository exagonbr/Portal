import { Router } from 'express';
import { UnitsController } from '../controllers/UnitsController';
import { optimizedAuthMiddleware } from '../middleware/optimizedAuth.middleware';

const router = Router();
const unitsController = new UnitsController();

/**
 * @route GET /api/units
 * @desc Get all units
 * @access Private
 */
router.get('/', optimizedAuthMiddleware, unitsController.getAll.bind(unitsController));

/**
 * @route GET /api/units/search
 * @desc Search units
 * @access Private
 */
router.get('/search', optimizedAuthMiddleware, unitsController.getAll.bind(unitsController));

/**
 * @route GET /api/units/:id
 * @desc Get unit by ID
 * @access Private
 */
router.get('/:id', optimizedAuthMiddleware, unitsController.getById.bind(unitsController));

/**
 * @route POST /api/units
 * @desc Create a new unit
 * @access Private
 */
router.post('/', optimizedAuthMiddleware, unitsController.create.bind(unitsController));

/**
 * @route PUT /api/units/:id
 * @desc Update a unit
 * @access Private
 */
router.put('/:id', optimizedAuthMiddleware, unitsController.update.bind(unitsController));

/**
 * @route DELETE /api/units/:id
 * @desc Delete a unit (soft delete)
 * @access Private
 */
router.delete('/:id', optimizedAuthMiddleware, unitsController.delete.bind(unitsController));

/**
 * @route POST /api/units/:id/restore
 * @desc Restore a deleted unit
 * @access Private
 */
router.post('/:id/restore', optimizedAuthMiddleware, unitsController.restore.bind(unitsController));

/**
 * @route GET /api/units/institution/:institutionId
 * @desc Get units by institution
 * @access Private
 */
router.get('/institution/:institutionId', optimizedAuthMiddleware, unitsController.getByInstitution.bind(unitsController));

export default router;
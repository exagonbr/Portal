import { Router } from 'express';
import { UnitsController } from '../controllers/UnitsController';
import { authenticateToken as authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const unitsController = new UnitsController();

/**
 * @route GET /api/units
 * @desc Get all units
 * @access Private
 */
router.get('/', authMiddleware, unitsController.getAll.bind(unitsController));

/**
 * @route GET /api/units/search
 * @desc Search units
 * @access Private
 */
router.get('/search', authMiddleware, unitsController.getAll.bind(unitsController));

/**
 * @route GET /api/units/:id
 * @desc Get unit by ID
 * @access Private
 */
router.get('/:id', authMiddleware, unitsController.getById.bind(unitsController));

/**
 * @route POST /api/units
 * @desc Create a new unit
 * @access Private
 */
router.post('/', authMiddleware, unitsController.create.bind(unitsController));

/**
 * @route PUT /api/units/:id
 * @desc Update a unit
 * @access Private
 */
router.put('/:id', authMiddleware, unitsController.update.bind(unitsController));

/**
 * @route DELETE /api/units/:id
 * @desc Delete a unit (soft delete)
 * @access Private
 */
router.delete('/:id', authMiddleware, unitsController.delete.bind(unitsController));

/**
 * @route POST /api/units/:id/restore
 * @desc Restore a deleted unit
 * @access Private
 */
router.post('/:id/restore', authMiddleware, unitsController.restore.bind(unitsController));

/**
 * @route GET /api/units/institution/:institutionId
 * @desc Get units by institution
 * @access Private
 */
router.get('/institution/:institutionId', authMiddleware, unitsController.getByInstitution.bind(unitsController));

export default router;
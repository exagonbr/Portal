import { Router } from 'express';
import UnitController from '../controllers/UnitController';

const router = Router();

router.get('/', UnitController.getAllUnits);

export default router;
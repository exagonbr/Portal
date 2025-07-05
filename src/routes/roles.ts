import { Router } from 'express';
import RoleController from '../controllers/RoleController';

const router = Router();

router.get('/', RoleController.getAllRoles);

export default router;
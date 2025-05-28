import express from 'express';
import { validateJWT, requireRole, requireInstitution } from '../middleware/auth';

const router = express.Router();

// Subscribe to push notifications
router.post('/push-subscriptions',validateJWT, requireInstitution, async (req, res) => {

});

// Unsubscribe from push notifications
router.delete('/push-subscriptions/:endpoint',validateJWT, requireInstitution, async (req, res) => {

});

export default router;

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/SettingsController');
const { validateJWT } = require('../middleware/auth.ts');
const adminMiddleware = require('../middleware/admin');

// Aplicar middleware de autenticação e admin em todas as rotas
router.use(validateJWT);
router.use(adminMiddleware);

// AWS Settings
router.get('/aws', settingsController.getAwsSettings);
router.post('/aws', settingsController.saveAwsSettings);
router.put('/aws', settingsController.saveAwsSettings);
router.delete('/aws/:id', settingsController.deleteAwsSettings);

// Background Settings
router.get('/background', settingsController.getBackgroundSettings);
router.post('/background', settingsController.saveBackgroundSettings);
router.put('/background', settingsController.saveBackgroundSettings);

// General Settings
router.get('/general', settingsController.getGeneralSettings);
router.post('/general', settingsController.saveGeneralSettings);
router.put('/general', settingsController.saveGeneralSettings);

// Security Settings
router.get('/security', settingsController.getSecuritySettings);
router.post('/security', settingsController.saveSecuritySettings);
router.put('/security', settingsController.saveSecuritySettings);

// Email Settings
router.get('/email', settingsController.getEmailSettings);
router.post('/email', settingsController.saveEmailSettings);
router.put('/email', settingsController.saveEmailSettings);

// Test connections
router.post('/test-s3', settingsController.testS3Connection);
router.post('/test-email', settingsController.testEmailConnection);

// Get all settings
router.get('/all', settingsController.getAllSettings);

module.exports = router; 
import express, { Request, Response } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { optimizedAuthMiddleware } from '../middleware/optimizedAuth.middleware';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';
import SystemSettingsService from '../services/SystemSettingsService';
import { emailService } from '../services/emailService';
import db from '../config/database';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar configurações'
    });
  }
  
  next();
};

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await SystemSettingsService.getFormattedSettings();

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.log('Erro ao buscar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar configurações' 
    });
  }
});

/**
 * @swagger
 * /api/settings/{category}:
 *   get:
 *     summary: Get settings by category
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category settings
 */
router.get('/settings/:category', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const settings = await SystemSettingsService.getSettingsByCategory(category, true);

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.log('Erro ao buscar configurações por categoria:', error);
    return res.status(500).json({ 
      success: false,
      error: `Erro ao buscar configurações da categoria ${req.params.category}` 
    });
  }
});

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.put('/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    await SystemSettingsService.updateSettings(updates);

    // Se alguma configuração de email foi atualizada, reconfigurar o serviço
    const emailKeys = ['email_smtp_host', 'email_smtp_port', 'email_smtp_user', 'email_smtp_password', 'email_smtp_secure'];
    const hasEmailUpdates = Object.keys(updates).some(key => emailKeys.includes(key));
    
    if (hasEmailUpdates) {
      console.log('🔄 Reconfigurando serviço de email após atualização das configurações...');
      await emailService.reconfigure();
    }

    return res.json({ 
      success: true,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.log('Erro ao atualizar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar configurações' 
    });
  }
});

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset settings to default
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset
 */
router.post('/settings/reset', requireAdmin, async (req: Request, res: Response) => {
  try {
    await SystemSettingsService.resetToDefaults();

    return res.json({ 
      success: true,
      message: 'Configurações resetadas para padrão com sucesso'
    });
  } catch (error) {
    console.log('Erro ao resetar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao resetar configurações' 
    });
  }
});

/**
 * @swagger
 * /api/settings/test-aws:
 *   post:
 *     summary: Test AWS configuration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AWS test result
 */
router.post('/settings/test-aws', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { accessKeyId, secretAccessKey, region } = req.body;

    if (!accessKeyId || !secretAccessKey || !region) {
      return res.status(400).json({ 
        success: false,
        error: 'Credenciais AWS incompletas' 
      });
    }

    // Configurar cliente S3
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    try {
      // Testar conexão listando buckets
      const command = new ListBucketsCommand({});
      const response = await s3Client.send(command);
      
      const buckets = response.Buckets?.map(bucket => bucket.Name) || [];

      return res.json({
        success: true,
        buckets,
        message: 'Conexão AWS estabelecida com sucesso!'
      });
    } catch (awsError: any) {
      console.log('Erro AWS:', awsError);
      return res.status(400).json({
        success: false,
        message: `Erro ao conectar com AWS: ${awsError.message || 'Verifique as credenciais'}`
      });
    }
  } catch (error) {
    console.log('Erro ao testar conexão AWS:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao testar conexão AWS' 
    });
  }
});

/**
 * @swagger
 * /api/settings/test-email:
 *   post:
 *     summary: Test email configuration
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email test result
 */
router.post('/settings/test-email', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { host, port, user, password, secure, fromAddress } = req.body;

    if (!host || !port || !user || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Configurações de email incompletas' 
      });
    }

    // Criar transporter
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure || port === 465,
      auth: {
        user,
        pass: password
      }
    });

    try {
      // Verificar conexão
      await transporter.verify();

      // Enviar email de teste
      await transporter.sendMail({
        from: fromAddress || user,
        to: req.user?.email,
        subject: 'Teste de Configuração de Email - Portal Educacional',
        html: `
          <h2>Teste de Email Bem-sucedido!</h2>
          <p>Este é um email de teste enviado pelo Portal Educacional.</p>
          <p>Se você recebeu este email, as configurações de email estão funcionando corretamente.</p>
          <hr>
          <p><small>Email enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
        `
      });

      return res.json({
        success: true,
        message: 'Email de teste enviado com sucesso!'
      });
    } catch (emailError: any) {
      console.log('Erro ao enviar email:', emailError);
      return res.status(400).json({
        success: false,
        message: `Erro ao enviar email: ${emailError.message || 'Verifique as configurações'}`
      });
    }
  } catch (error) {
    console.log('Erro ao testar email:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao testar configuração de email' 
    });
  }
});

/**
 * @swagger
 * /api/settings/reconfigure-email:
 *   post:
 *     summary: Reconfigure email settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email reconfigured
 */
router.post('/settings/reconfigure-email', requireAdmin, async (req: Request, res: Response) => {
  try {
    console.log('🔄 Reconfigurando serviço de email manualmente...');
    await emailService.reconfigure();

    const status = emailService.getStatus();

    return res.json({
      success: true,
      message: 'Serviço de email reconfigurado',
      data: {
        enabled: status.enabled,
        error: status.error
      }
    });
  } catch (error) {
    console.log('Erro ao reconfigurar serviço de email:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao reconfigurar serviço de email' 
    });
  }
});

export default router; 
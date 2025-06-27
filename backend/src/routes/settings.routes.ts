import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';
import SystemSettingsService from '../services/SystemSettingsService';
import { emailService } from '../services/emailService';
import db from '../config/database';

const router = Router();

// GET - Buscar todas as configurações
router.get('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    const adminRoles = ['admin', 'system_admin', 'administrator', 'SYSTEM_ADMIN', 'ADMIN'];
    if (!req.user?.role || !adminRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const settings = await SystemSettingsService.getFormattedSettings();

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar configurações' 
    });
  }
});

// GET - Buscar configurações por categoria
router.get('/settings/:category', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { category } = req.params;
    const settings = await SystemSettingsService.getSettingsByCategory(category, true);

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações por categoria:', error);
    return res.status(500).json({ 
      success: false,
      error: `Erro ao buscar configurações da categoria ${req.params.category}` 
    });
  }
});

// PUT - Atualizar configurações
router.put('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

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
    console.error('Erro ao atualizar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao atualizar configurações' 
    });
  }
});

// POST - Resetar configurações para padrão
router.post('/settings/reset', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await SystemSettingsService.resetToDefaults();

    return res.json({ 
      success: true,
      message: 'Configurações resetadas para padrão com sucesso'
    });
  } catch (error) {
    console.error('Erro ao resetar configurações:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao resetar configurações' 
    });
  }
});

// POST - Testar conexão AWS
router.post('/settings/test-aws', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

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
      console.error('Erro AWS:', awsError);
      return res.status(400).json({
        success: false,
        message: `Erro ao conectar com AWS: ${awsError.message || 'Verifique as credenciais'}`
      });
    }
  } catch (error) {
    console.error('Erro ao testar conexão AWS:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao testar conexão AWS' 
    });
  }
});

// POST - Testar conexão de email
router.post('/settings/test-email', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

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
        to: req.user.email,
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
      console.error('Erro ao enviar email:', emailError);
      return res.status(400).json({
        success: false,
        message: `Erro ao enviar email: ${emailError.message || 'Verifique as configurações'}`
      });
    }
  } catch (error) {
    console.error('Erro ao testar email:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao testar configuração de email' 
    });
  }
});

// POST - Reconfigurar serviço de email
router.post('/settings/reconfigure-email', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

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
    console.error('Erro ao reconfigurar serviço de email:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao reconfigurar serviço de email' 
    });
  }
});

// GET - Buscar configurações públicas (para uso geral do sistema)
router.get('/settings/public', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Buscando configurações públicas...');
    
    // Verificar se a tabela system_settings existe
    const hasTable = await db.schema.hasTable('system_settings');
    
    if (!hasTable) {
      console.warn('⚠️ Tabela system_settings não existe, retornando configurações padrão');
      
      // Retornar configurações padrão
      const defaultSettings = {
        general: {
          site_name: 'Portal Sabercon',
          site_title: 'Portal Educacional Sabercon',
          site_url: 'https://portal.sabercon.com.br',
          site_description: 'Sistema completo de gestão educacional',
          maintenance_mode: false
        },
        appearance: {
          logo_light: '/logo-light.png',
          logo_dark: '/logo-dark.png',
          background_type: 'video',
          main_background: '/back_video.mp4',
          primary_color: '#1e3a8a',
          secondary_color: '#3b82f6'
        }
      };

      return res.json({
        success: true,
        fallback: true,
        message: 'Usando configurações padrão - tabela não encontrada',
        data: defaultSettings
      });
    }

    const settings = await SystemSettingsService.getAllSettings(false); // Apenas públicas
    console.log('✅ Configurações públicas carregadas com sucesso');

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configurações públicas:', error);
    
    // Fallback com configurações padrão em caso de erro
    const fallbackSettings = {
      general: {
        site_name: 'Portal Educacional',
        site_title: 'Portal Educacional',
        site_url: 'https://portal.educacional.com',
        maintenance_mode: false
      },
      appearance: {
        background_type: 'color',
        main_background: '#1e3a8a',
        primary_color: '#1e3a8a',
        secondary_color: '#3b82f6'
      }
    };

    return res.json({ 
      success: true,
      fallback: true,
      error: 'Erro ao acessar banco de dados',
      message: 'Usando configurações de emergência',
      data: fallbackSettings
    });
  }
});

export default router; 
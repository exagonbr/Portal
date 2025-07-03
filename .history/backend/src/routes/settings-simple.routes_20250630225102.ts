import { Router, Request, Response } from 'express';
import { authenticateToken as authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET - Buscar configurações públicas (sem autenticação)
router.get('/public', async (req: Request, res: Response) => {
  try {
    console.log('🔍 Rota /settings/public acessada');
    
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
        main_background: '/back_video4.mp4',
        primary_color: '#1e3a8a',
        secondary_color: '#3b82f6'
      },
      aws: {
        aws_access_key: 'AKIAYKBH43KYB2DJUQJL',
        aws_secret_key: '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',
        aws_region: 'sa-east-1',
        aws_bucket_main: '',
        aws_bucket_backup: '',
        aws_bucket_media: ''
      },
      email: {
        email_smtp_host: 'smtp.gmail.com',
        email_smtp_port: 587,
        email_smtp_user: 'sabercon@sabercon.com.br',
        email_smtp_password: 'Mayta#P1730*K',
        email_smtp_secure: true,
        email_from_name: 'Portal Educacional - Sabercon',
        email_from_address: 'noreply@sabercon.com.br'
      },
      notifications: {
        notifications_email_enabled: true,
        notifications_sms_enabled: false,
        notifications_push_enabled: true,
        notifications_digest_frequency: 'daily'
      }
    };

    return res.json({
      success: true,
      data: defaultSettings
    });
  } catch (error) {
    console.error('❌ Erro ao buscar configurações públicas:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar configurações públicas'
    });
  }
});

// GET - Buscar todas as configurações (com autenticação)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: 'Settings route is working',
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar configurações'
    });
  }
});

export default router;
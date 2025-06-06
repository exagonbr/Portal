import { Router, Request, Response } from 'express';
import db from '../config/database';
import { authMiddleware } from '../middleware/auth.middleware';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import nodemailer from 'nodemailer';

const router = Router();

// Interface para configurações
interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
}

// GET - Buscar todas as configurações
router.get('/settings', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Verificar se é admin
    if (req.user?.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const settings = await db<SystemSetting>('system_settings')
      .select('*')
      .orderBy(['category', 'key']);

    // Organizar por categoria
    const settingsByCategory = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = {
        value: setting.value,
        description: setting.description,
        id: setting.id
      };
      return acc;
    }, {} as Record<string, any>);

    res.json(settingsByCategory);
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
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

    // Atualizar cada configuração
    const updatePromises = Object.entries(updates).map(([key, value]) =>
      db('system_settings')
        .where({ key })
        .update({ 
          value: JSON.stringify(value),
          updated_at: new Date()
        })
    );

    await Promise.all(updatePromises);

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({ error: 'Erro ao atualizar configurações' });
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
      return res.status(400).json({ error: 'Credenciais AWS incompletas' });
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

      res.json({
        success: true,
        buckets,
        message: 'Conexão AWS estabelecida com sucesso!'
      });
    } catch (awsError: any) {
      console.error('Erro AWS:', awsError);
      res.status(400).json({
        success: false,
        message: `Erro ao conectar com AWS: ${awsError.message || 'Verifique as credenciais'}`
      });
    }
  } catch (error) {
    console.error('Erro ao testar conexão AWS:', error);
    res.status(500).json({ error: 'Erro ao testar conexão AWS' });
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
      return res.status(400).json({ error: 'Configurações de email incompletas' });
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

      res.json({
        success: true,
        message: 'Email de teste enviado com sucesso!'
      });
    } catch (emailError: any) {
      console.error('Erro ao enviar email:', emailError);
      res.status(400).json({
        success: false,
        message: `Erro ao enviar email: ${emailError.message || 'Verifique as configurações'}`
      });
    }
  } catch (error) {
    console.error('Erro ao testar email:', error);
    res.status(500).json({ error: 'Erro ao testar configuração de email' });
  }
});

export default router; 
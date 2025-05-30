import nodemailer from 'nodemailer';
import { env } from '../config/env';

export interface EmailOptions {
  to: string | string[];
  subject?: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private templates: Map<string, EmailTemplate> = new Map();
  private isEmailEnabled: boolean = false;
  private initializationError: string | null = null;

  constructor() {
    this.setupTransporter();
    this.loadTemplates();
  }

  private setupTransporter() {
    try {
      // Verificar se as configurações mínimas estão presentes
      if (!env.SMTP_HOST || env.SMTP_HOST === 'localhost') {
        this.isEmailEnabled = false;
        this.initializationError = 'Configuração de email não encontrada (SMTP_HOST não configurado)';
        console.log('⚠️  Email desabilitado: Configuração SMTP não encontrada. O sistema continuará funcionando sem envio de emails.');
        return;
      }

      // Configuração do transporter baseada nas variáveis de ambiente
      const smtpConfig = {
        host: env.SMTP_HOST,
        port: parseInt(env.SMTP_PORT),
        secure: env.SMTP_SECURE === 'true', // true para 465, false para outras portas
        auth: env.SMTP_USER && env.SMTP_PASS ? {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS
        } : undefined,
        tls: {
          rejectUnauthorized: env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
        }
      };

      this.transporter = nodemailer.createTransport(smtpConfig);

      // Verificar conexão de forma assíncrona, sem bloquear a inicialização
      this.verifyConnectionAsync();

    } catch (error) {
      this.isEmailEnabled = false;
      this.initializationError = `Erro na configuração do transporter: ${error}`;
      console.log('⚠️  Email desabilitado: Erro na configuração do transporter. O sistema continuará funcionando sem envio de emails.');
      console.log('Detalhes do erro:', error);
    }
  }

  private async verifyConnectionAsync() {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      this.isEmailEnabled = true;
      this.initializationError = null;
      console.log('✅ Servidor de email configurado com sucesso');
    } catch (error) {
      this.isEmailEnabled = false;
      this.initializationError = `Erro na verificação da conexão: ${error}`;
      console.log('⚠️  Email desabilitado: Não foi possível conectar ao servidor SMTP. O sistema continuará funcionando sem envio de emails.');
      console.log('Detalhes do erro:', error);
    }
  }

  private loadTemplates() {
    // Template de boas-vindas
    this.templates.set('welcome', {
      subject: 'Bem-vindo ao Portal Sabercon!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Bem-vindo ao Portal Sabercon!</h1>
          <p>Olá <strong>{{name}}</strong>,</p>
          <p>Seja bem-vindo ao Portal Sabercon! Sua conta foi criada com sucesso.</p>
          <p><strong>Suas informações de acesso:</strong></p>
          <ul>
            <li>Email: {{email}}</li>
            <li>Usuário: {{username}}</li>
          </ul>
          <p>Para acessar o portal, <a href="{{loginUrl}}" style="color: #2563eb;">clique aqui</a>.</p>
          <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
        </div>
      `,
      text: 'Bem-vindo ao Portal Sabercon! Olá {{name}}, sua conta foi criada com sucesso.'
    });

    // Template de recuperação de senha
    this.templates.set('password-reset', {
      subject: 'Recuperação de Senha - Portal Sabercon',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Recuperação de Senha</h1>
          <p>Olá <strong>{{name}}</strong>,</p>
          <p>Você solicitou a recuperação de sua senha. Clique no botão abaixo para redefinir sua senha:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou esta alteração, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
        </div>
      `,
      text: 'Recuperação de Senha - Portal Sabercon. Link: {{resetUrl}}'
    });

    // Template de notificação geral
    this.templates.set('notification', {
      subject: '{{subject}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">{{title}}</h1>
          <p>Olá <strong>{{name}}</strong>,</p>
          <div>{{message}}</div>
          <p>Atenciosamente,<br>Equipe Portal Sabercon</p>
        </div>
      `,
      text: '{{title}} - {{message}}'
    });

    // Template de alerta do sistema
    this.templates.set('system-alert', {
      subject: 'Alerta do Sistema - {{type}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626;">⚠️ Alerta do Sistema</h1>
          <p><strong>Tipo:</strong> {{type}}</p>
          <p><strong>Mensagem:</strong> {{message}}</p>
          <p><strong>Data/Hora:</strong> {{timestamp}}</p>
          <p>Equipe Portal Sabercon</p>
        </div>
      `,
      text: 'Alerta do Sistema - {{type}}: {{message}}'
    });
  }

  private renderTemplate(templateName: string, data: Record<string, any>): EmailTemplate | null {
    const template = this.templates.get(templateName);
    if (!template) return null;

    const renderText = (text: string, data: Record<string, any>): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    return {
      subject: renderText(template.subject, data),
      html: renderText(template.html, data),
      text: template.text ? renderText(template.text, data) : undefined
    };
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Verificar se o email está habilitado
    if (!this.isEmailEnabled || !this.transporter) {
      console.log('⚠️  Tentativa de envio de email ignorada: Serviço de email não está configurado ou disponível.');
      console.log('Destinatário:', options.to);
      console.log('Assunto:', options.subject || options.template);
      
      if (this.initializationError) {
        console.log('Motivo:', this.initializationError);
      }
      
      return false; // Retorna false mas não lança erro
    }

    try {
      let emailContent: { subject: string; html?: string; text?: string };

      if (options.template && options.data) {
        // Usar template
        const rendered = this.renderTemplate(options.template, options.data);
        if (!rendered) {
          throw new Error(`Template '${options.template}' não encontrado`);
        }
        emailContent = rendered;
      } else {
        // Usar conteúdo direto
        if (!options.subject) {
          throw new Error('Subject é obrigatório quando não se usa template');
        }
        emailContent = {
          subject: options.subject,
          html: options.html,
          text: options.text
        };
      }

      const mailOptions: nodemailer.SendMailOptions = {
        from: options.from || env.EMAIL_FROM,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email enviado com sucesso:', {
        to: options.to,
        subject: emailContent.subject,
        messageId: result.messageId
      });

      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      console.log('⚠️  O sistema continuará funcionando normalmente sem o envio deste email.');
      return false; // Retorna false em vez de lançar erro
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'welcome',
      data: {
        name: userName,
        email: userEmail,
        username: username,
        loginUrl: `${env.FRONTEND_URL}/login`
      }
    });
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'password-reset',
      data: {
        name: userName,
        resetUrl: `${env.FRONTEND_URL}/reset-password?token=${resetToken}`
      }
    });
  }

  async sendNotificationEmail(
    userEmail: string, 
    userName: string, 
    title: string, 
    message: string,
    actionUrl?: string,
    actionText?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'notification',
      data: {
        name: userName,
        title,
        message,
        subject: title,
        actionUrl,
        actionText
      }
    });
  }

  async sendSystemAlert(
    recipients: string[], 
    type: string, 
    message: string, 
    details?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: recipients,
      template: 'system-alert',
      data: {
        type,
        message,
        details,
        timestamp: new Date().toLocaleString('pt-BR')
      }
    });
  }

  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      console.log('⚠️  Verificação de conexão ignorada: Transporter não configurado.');
      return false;
    }

    try {
      await this.transporter.verify();
      this.isEmailEnabled = true;
      this.initializationError = null;
      return true;
    } catch (error) {
      this.isEmailEnabled = false;
      this.initializationError = `Erro na verificação da conexão: ${error}`;
      console.log('⚠️  Erro na verificação da conexão de email:', error);
      return false;
    }
  }

  // Método para verificar se o email está habilitado
  isEnabled(): boolean {
    return this.isEmailEnabled;
  }

  // Método para obter informações sobre o status do serviço
  getStatus(): { enabled: boolean; error?: string } {
    return {
      enabled: this.isEmailEnabled,
      error: this.initializationError || undefined
    };
  }
}

export const emailService = new EmailService();
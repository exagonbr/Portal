import nodemailer from 'nodemailer';
import { env } from '../config/env';
import SystemSettingsService from './SystemSettingsService';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      const settingsService = SystemSettingsService;
      const emailSettings = await settingsService.getSettingsByCategory('email', true);

      const config = {
        host: emailSettings.email_smtp_host || env.SMTP_HOST,
        port: emailSettings.email_smtp_port || parseInt(env.SMTP_PORT || '587'),
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: emailSettings.email_smtp_user || '',
          pass: emailSettings.email_smtp_password || '',
        },
      };

      if (config.host && config.auth.user && config.auth.pass) {
        this.transporter = nodemailer.createTransport(config);
        await this.transporter.verify();
        console.log('✅ Servidor de email configurado com sucesso');
      } else {
        console.log('⚠️  Configuração de email não encontrada. O envio de emails está desabilitado.');
      }
    } catch (error) {
      console.error('❌ Erro ao inicializar o serviço de email:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.log('⚠️  Tentativa de envio de email ignorada: Serviço de email não está configurado.');
      return false;
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: options.from || env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email enviado para: ${options.to}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      return false;
    }
  }
}

export default new EmailService();
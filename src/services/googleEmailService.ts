import { ENV_CONFIG } from '@/config/env';

export interface GoogleEmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from?: string;
}

export interface GoogleEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface GoogleEmailResult {
  success: boolean;
  message: string;
  messageId?: string;
  error?: string;
}

/**
 * Serviço desacoplado para envio de emails via Google/Gmail
 * Suporta fallback automático entre configurações do sistema e ENV
 */
export class GoogleEmailService {
  private static instance: GoogleEmailService;
  private config: GoogleEmailConfig | null = null;
  private isConfigured = false;
  private lastConfigCheck = 0;
  private readonly CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  constructor() {
    this.initializeConfig();
  }

  /**
   * Singleton pattern para garantir uma única instância
   */
  static getInstance(): GoogleEmailService {
    if (!GoogleEmailService.instance) {
      GoogleEmailService.instance = new GoogleEmailService();
    }
    return GoogleEmailService.instance;
  }

  /**
   * Inicializa as configurações do Google Email
   * Tenta primeiro as configurações do sistema, depois fallback para ENV
   */
  private async initializeConfig(): Promise<void> {
    try {
      console.log('🔧 [GoogleEmail] Inicializando configurações...');

      // Verificar se precisamos recarregar as configurações (cache TTL)
      const now = Date.now();
      if (this.isConfigured && (now - this.lastConfigCheck) < this.CONFIG_CACHE_TTL) {
        console.log('🔄 [GoogleEmail] Usando configurações em cache');
        return;
      }

      // Buscar configurações do sistema primeiro
      const systemConfig = await this.getSystemEmailConfig();
      
      if (systemConfig && this.isValidConfig(systemConfig)) {
        this.config = systemConfig;
        this.isConfigured = true;
        this.lastConfigCheck = now;
        console.log('✅ [GoogleEmail] Configurado via sistema');
        return;
      }

      // Fallback para variáveis de ambiente
      const envConfig = this.getEnvEmailConfig();
      
      if (envConfig && this.isValidConfig(envConfig)) {
        this.config = envConfig;
        this.isConfigured = true;
        this.lastConfigCheck = now;
        console.log('✅ [GoogleEmail] Configurado via ENV');
        return;
      }

      // Configuração padrão do Gmail como último recurso
      const defaultConfig = this.getDefaultGmailConfig();
      if (defaultConfig && this.isValidConfig(defaultConfig)) {
        this.config = defaultConfig;
        this.isConfigured = false; // Marcar como não configurado pois usa dados padrão
        this.lastConfigCheck = now;
        console.log('⚠️ [GoogleEmail] Usando configuração padrão do Gmail');
        return;
      }

      console.error('❌ [GoogleEmail] Nenhuma configuração válida encontrada');
      this.config = null;
      this.isConfigured = false;

    } catch (error) {
      console.error('❌ [GoogleEmail] Erro ao inicializar configurações:', error);
      this.config = null;
      this.isConfigured = false;
    }
  }

  /**
   * Busca configurações de email do sistema (banco de dados)
   */
  private async getSystemEmailConfig(): Promise<GoogleEmailConfig | null> {
    try {
      const response = await fetch('/api/settings/email', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log('⚠️ [GoogleEmail] API de configurações não disponível');
        return null;
      }

      const settings = await response.json();
      
      if (!settings || !settings.email_smtp_host) {
        console.log('⚠️ [GoogleEmail] Configurações de email não encontradas no sistema');
        return null;
      }

      return {
        host: settings.email_smtp_host,
        port: parseInt(settings.email_smtp_port || '587'),
        secure: settings.email_smtp_secure === true || settings.email_smtp_secure === 'true',
        user: settings.email_smtp_user,
        pass: settings.email_smtp_password,
        from: settings.email_from_address || settings.email_smtp_user,
      };
    } catch (error) {
      console.log('⚠️ [GoogleEmail] Erro ao buscar configurações do sistema:', error);
      return null;
    }
  }

  /**
   * Busca configurações de email das variáveis de ambiente
   */
  private getEnvEmailConfig(): GoogleEmailConfig | null {
    try {
      // Verificar se as variáveis de ambiente estão definidas
      if (typeof window !== 'undefined') {
        // No cliente, não temos acesso às variáveis de ambiente do servidor
        return null;
      }

      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host || !user || !pass || host === 'localhost') {
        console.log('⚠️ [GoogleEmail] Variáveis de ambiente de email não configuradas');
        return null;
      }

      return {
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        user,
        pass,
        from: process.env.EMAIL_FROM || user,
      };
    } catch (error) {
      console.log('⚠️ [GoogleEmail] Erro ao ler variáveis de ambiente:', error);
      return null;
    }
  }

  /**
   * Configuração padrão do Gmail para desenvolvimento/teste
   */
  private getDefaultGmailConfig(): GoogleEmailConfig | null {
    // Esta configuração só deve ser usada em desenvolvimento
    if (ENV_CONFIG.IS_PRODUCTION) {
      return null;
    }

    console.log('⚠️ [GoogleEmail] Usando configuração padrão - Configure as credenciais reais');
    
    return {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // STARTTLS
      user: 'seuemail@gmail.com', // Placeholder
      pass: 'sua-senha-de-app', // Placeholder
      from: 'noreply@portal.sabercon.com.br',
    };
  }

  /**
   * Valida se uma configuração é válida
   */
  private isValidConfig(config: GoogleEmailConfig): boolean {
    return !!(
      config.host &&
      config.port &&
      config.user &&
      config.pass &&
      config.host !== 'localhost' &&
      config.user !== 'seuemail@gmail.com' &&
      config.pass !== 'sua-senha-de-app'
    );
  }

  /**
   * Verifica se o serviço está configurado corretamente
   */
  public async isServiceConfigured(): Promise<boolean> {
    await this.initializeConfig();
    return this.isConfigured && this.config !== null;
  }

  /**
   * Obtém as configurações atuais (sem mostrar a senha)
   */
  public async getConfigStatus(): Promise<{
    configured: boolean;
    host?: string;
    port?: number;
    user?: string;
    source: 'system' | 'env' | 'default' | 'none';
  }> {
    await this.initializeConfig();
    
    if (!this.config) {
      return { configured: false, source: 'none' };
    }

    // Determinar a fonte da configuração
    let source: 'system' | 'env' | 'default' = 'default';
    if (this.isConfigured) {
      // Verificar se parece com configuração do sistema ou ENV
      if (this.config.user.includes('@gmail.com') && this.config.host === 'smtp.gmail.com') {
        source = 'system'; // Assumir que é do sistema se estiver bem configurado
      } else {
        source = 'env';
      }
    }

    return {
      configured: this.isConfigured,
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      source,
    };
  }

  /**
   * Força a reconfiguração do serviço
   */
  public async reconfigure(): Promise<void> {
    console.log('🔄 [GoogleEmail] Forçando reconfiguração...');
    this.lastConfigCheck = 0; // Força reload das configurações
    this.isConfigured = false;
    this.config = null;
    await this.initializeConfig();
  }

  /**
   * Testa a conexão com o servidor Gmail
   */
  public async testConnection(): Promise<GoogleEmailResult> {
    try {
      await this.initializeConfig();
      
      if (!this.config) {
        return {
          success: false,
          message: 'Serviço de email não está configurado',
          error: 'NO_CONFIG',
        };
      }

      // Enviar requisição para o endpoint de teste
      const response = await fetch('/api/google-email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            ...this.config,
            pass: '***', // Não enviar a senha real no teste
          },
        }),
      });

      const result = await response.json();
      
      return {
        success: result.success || false,
        message: result.message || 'Teste de conexão realizado',
        error: result.error,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Erro ao testar conexão',
        error: error.message,
      };
    }
  }

  /**
   * Envia um email via Google/Gmail
   */
  public async sendEmail(options: GoogleEmailOptions): Promise<GoogleEmailResult> {
    try {
      console.log('📧 [GoogleEmail] Iniciando envio de email...');
      
      // Validar entrada
      if (!options.to || !options.subject) {
        return {
          success: false,
          message: 'Destinatário e assunto são obrigatórios',
          error: 'INVALID_INPUT',
        };
      }

      if (!options.html && !options.text) {
        return {
          success: false,
          message: 'Conteúdo do email (HTML ou texto) é obrigatório',
          error: 'INVALID_INPUT',
        };
      }

      // Verificar configuração
      await this.initializeConfig();
      
      if (!this.config) {
        return {
          success: false,
          message: 'Serviço de email não está configurado. Configure as credenciais do Gmail.',
          error: 'NO_CONFIG',
        };
      }

      // Preparar dados para envio
      const emailData = {
        config: this.config,
        options: {
          ...options,
          from: options.from || this.config.from || this.config.user,
        },
      };

      // Enviar via API
      const response = await fetch('/api/google-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ [GoogleEmail] Email enviado com sucesso');
        return {
          success: true,
          message: result.message || 'Email enviado com sucesso',
          messageId: result.messageId,
        };
      } else {
        console.error('❌ [GoogleEmail] Erro no envio:', result.error);
        return {
          success: false,
          message: result.message || 'Erro ao enviar email',
          error: result.error,
        };
      }
    } catch (error: any) {
      console.error('❌ [GoogleEmail] Erro geral no envio:', error);
      return {
        success: false,
        message: 'Erro interno no serviço de email',
        error: error.message,
      };
    }
  }

  /**
   * Envia múltiplos emails (em lote)
   */
  public async sendBulkEmails(emails: GoogleEmailOptions[]): Promise<{
    success: boolean;
    results: GoogleEmailResult[];
    summary: {
      total: number;
      sent: number;
      failed: number;
    };
  }> {
    console.log(`📧 [GoogleEmail] Enviando ${emails.length} emails em lote...`);
    
    const results: GoogleEmailResult[] = [];
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push(result);
        
        if (result.success) {
          sent++;
        } else {
          failed++;
        }

        // Pequeno delay entre envios para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        const errorResult: GoogleEmailResult = {
          success: false,
          message: 'Erro no envio em lote',
          error: error.message,
        };
        results.push(errorResult);
        failed++;
      }
    }

    const success = failed === 0;
    
    console.log(`📧 [GoogleEmail] Lote concluído: ${sent} enviados, ${failed} falharam`);
    
    return {
      success,
      results,
      summary: {
        total: emails.length,
        sent,
        failed,
      },
    };
  }
}

// Exportar instância singleton
export const googleEmailService = GoogleEmailService.getInstance();

// Exportar função utilitária para uso direto
export const sendGoogleEmail = (options: GoogleEmailOptions): Promise<GoogleEmailResult> => {
  return googleEmailService.sendEmail(options);
};

// Exportar função para testar configuração
export const testGoogleEmailConfig = (): Promise<GoogleEmailResult> => {
  return googleEmailService.testConnection();
};

// Exportar função para verificar status
export const getGoogleEmailStatus = () => {
  return googleEmailService.getConfigStatus();
}; 
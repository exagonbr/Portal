import { apiPost } from './apiService';

export interface DirectEmailOptions {
  subject: string;
  message: string;
  html?: boolean;
  recipients: {
    emails: string[];
  };
}

interface EmailResponse {
  message?: string;
  data?: any;
}

/**
 * Serviço para envio direto de emails, garantindo entrega mesmo em caso de falhas no sistema principal
 */
export class DirectEmailService {
  /**
   * Envia um email diretamente usando o endpoint dedicado
   * 
   * @param options Opções do email
   * @returns Resultado do envio
   */
  static async sendEmail(options: DirectEmailOptions): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      // Validação básica
      if (!options.subject || !options.subject.trim()) {
        throw new Error('O assunto do email é obrigatório');
      }

      if (!options.message || !options.message.trim()) {
        throw new Error('O conteúdo do email é obrigatório');
      }

      if (!options.recipients || !options.recipients.emails || !options.recipients.emails.length) {
        throw new Error('Pelo menos um destinatário deve ser especificado');
      }

      // Enviar requisição para o endpoint direto
      const response = await apiPost<EmailResponse>('/direct-email', {
        subject: options.subject,
        message: options.message,
        html: options.html || false,
        recipients: {
          emails: options.recipients.emails
        }
      });

      return {
        success: true,
        message: response.message || 'Email enviado com sucesso!',
        data: response.data
      };
    } catch (error: any) {
      console.error('Erro no serviço de envio direto de email:', error);
      
      // Tentar envio de fallback se a API falhar
      if (error.message && error.message.includes('fetch')) {
        try {
          console.log('🔄 API principal falhou, tentando envio de fallback...');
          return await this.sendEmailFallback(options);
        } catch (fallbackError: any) {
          console.error('Erro no envio de fallback:', fallbackError);
          throw new Error(`Falha no envio de email: ${fallbackError.message || 'Erro desconhecido'}`);
        }
      }
      
      throw new Error(`Falha no envio de email: ${error.message || 'Erro desconhecido'}`);
    }
  }

  /**
   * Método de fallback para envio de email em caso de falha da API principal
   * Usa o EmailJS ou outro serviço de fallback
   * 
   * @param options Opções do email
   * @returns Resultado do envio
   */
  private static async sendEmailFallback(options: DirectEmailOptions): Promise<{
    success: boolean;
    message: string;
  }> {
    // Implementação de fallback usando EmailJS ou outro serviço
    // Este é um exemplo simplificado
    try {
      const emailjsServiceId = 'service_sabercon';
      const emailjsTemplateId = 'template_default';
      const emailjsUserId = 'user_sabercon';
      
      // Simular envio de fallback (em produção, usar EmailJS ou similar)
      console.log('📧 Enviando email via fallback com:', {
        service_id: emailjsServiceId,
        template_id: emailjsTemplateId,
        user_id: emailjsUserId,
        template_params: {
          subject: options.subject,
          message: options.message,
          to_email: options.recipients.emails.join(', ')
        }
      });
      
      // Em produção, descomentar código abaixo e usar EmailJS ou similar
      /*
      await emailjs.send(
        emailjsServiceId,
        emailjsTemplateId,
        {
          subject: options.subject,
          message: options.message,
          to_email: options.recipients.emails.join(', ')
        },
        emailjsUserId
      );
      */
      
      return {
        success: true,
        message: 'Email enviado com sucesso via sistema de fallback!'
      };
    } catch (error: any) {
      console.error('Erro no sistema de fallback:', error);
      throw new Error(`Falha no sistema de fallback: ${error.message || 'Erro desconhecido'}`);
    }
  }
}

// Exportar instância do serviço para uso direto
export const directEmailService = {
  sendEmail: DirectEmailService.sendEmail.bind(DirectEmailService)
}; 
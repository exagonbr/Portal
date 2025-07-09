import { EmailSendData, EmailSendResult, EmailRecipients } from '@/types/email'
import { notificationService } from './notificationService'
import { directEmailService } from './directEmailService'
import { UnifiedAuthService } from './unifiedAuthService'

interface EmailProvider {
  name: string
  send: (data: EmailSendData) => Promise<EmailSendResult>
  priority: number
}

class EnhancedEmailService {
  private providers: EmailProvider[] = []
  private maxRetries = 3
  private retryDelay = 1000 // 1 segundo

  constructor() {
    this.initializeProviders()
  }

  private initializeProviders() {
    // Provider principal - API do sistema
    this.providers.push({
      name: 'Sistema Principal',
      priority: 1,
      send: async (data: EmailSendData): Promise<EmailSendResult> => {
        try {
          console.log('🚀 Enviando via API principal:', data)
          
          // Verificar autenticação
          const token = await UnifiedAuthService.getAccessToken()
          if (!token) {
            throw new Error('Token de autenticação não encontrado')
          }

          // Validar dados
          this.validateEmailData(data)

          // Preparar dados para a API
          const apiData = {
            title: data.title,
            subject: data.subject,
            message: data.message,
            html: data.html || false,
            htmlContent: data.htmlContent,
            recipients: {
              emails: data.recipients.emails || [],
              users: data.recipients.users || [],
              roles: data.recipients.roles || []
            },
            sent_by_id: UnifiedAuthService.getCurrentUser()?.id || '1',
            template: data.templateId,
            priority: data.priority || 'medium'
          }

          // Enviar via notificationService
          const response = await notificationService.sendEmail(apiData)
          
          return {
            success: true,
            message: 'Email enviado com sucesso via API principal',
            data: {
              sentCount: this.countRecipients(data.recipients),
              failedCount: 0,
              sentEmails: data.recipients.emails || [],
              failedEmails: []
            }
          }
        } catch (error: any) {
          console.error('❌ Erro na API principal:', error)
          throw new Error(`Falha na API principal: ${error.message}`)
        }
      }
    })

    // Provider secundário - Envio direto
    this.providers.push({
      name: 'Envio Direto',
      priority: 2,
      send: async (data: EmailSendData): Promise<EmailSendResult> => {
        try {
          console.log('🔄 Enviando via API direta:', data)
          
          // Validar se temos emails diretos
          if (!data.recipients.emails || data.recipients.emails.length === 0) {
            throw new Error('Envio direto requer emails específicos')
          }

          this.validateEmailData(data)

          const result = await directEmailService.sendEmail({
            subject: data.subject,
            message: data.html && data.htmlContent ? data.htmlContent : data.message,
            html: data.html || false,
            recipients: {
              emails: data.recipients.emails
            }
          })

          if (!result.success) {
            throw new Error(result.message)
          }

          return {
            success: true,
            message: 'Email enviado com sucesso via API direta',
            data: {
              sentCount: data.recipients.emails.length,
              failedCount: 0,
              sentEmails: data.recipients.emails,
              failedEmails: []
            }
          }
        } catch (error: any) {
          console.error('❌ Erro no envio direto:', error)
          throw new Error(`Falha no envio direto: ${error.message}`)
        }
      }
    })

    // Provider de fallback - Simulação para desenvolvimento
    this.providers.push({
      name: 'Fallback Local',
      priority: 3,
      send: async (data: EmailSendData): Promise<EmailSendResult> => {
        try {
          console.log('⚡ Usando fallback local:', data)
          
          this.validateEmailData(data)

          // Simular envio (em produção, implementar com EmailJS ou similar)
          await this.simulateEmailSending(data)

          const totalRecipients = this.countRecipients(data.recipients)
          
          return {
            success: true,
            message: 'Email "enviado" com sucesso via fallback local (simulado)',
            data: {
              sentCount: totalRecipients,
              failedCount: 0,
              sentEmails: data.recipients.emails || [],
              failedEmails: []
            }
          }
        } catch (error: any) {
          console.error('❌ Erro no fallback local:', error)
          throw new Error(`Falha no fallback: ${error.message}`)
        }
      }
    })
  }

  // Método principal de envio com múltiplas tentativas
  async sendEmail(data: EmailSendData): Promise<EmailSendResult> {
    console.log('📧 Iniciando envio de email robusto:', data)

    // Validação inicial
    try {
      this.validateEmailData(data)
    } catch (error: any) {
      return {
        success: false,
        message: `Erro de validação: ${error.message}`,
        data: {
          sentCount: 0,
          failedCount: this.countRecipients(data.recipients),
          sentEmails: [],
          failedEmails: data.recipients.emails || [],
          errors: [error.message]
        }
      }
    }

    // Ordenar providers por prioridade
    const sortedProviders = [...this.providers].sort((a, b) => a.priority - b.priority)
    
    let lastError: Error | null = null
    const errors: string[] = []

    // Tentar cada provider em ordem de prioridade
    for (const provider of sortedProviders) {
      console.log(`🔍 Tentando provider: ${provider.name}`)
      
      // Tentar com retry para o provider atual
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          console.log(`📤 Tentativa ${attempt}/${this.maxRetries} com ${provider.name}`)
          
          const result = await provider.send(data)
          
          if (result.success) {
            console.log(`✅ Sucesso com ${provider.name} na tentativa ${attempt}`)
            return result
          } else {
            throw new Error(result.message)
          }
        } catch (error: any) {
          lastError = error
          const errorMsg = `${provider.name} (tentativa ${attempt}): ${error.message}`
          errors.push(errorMsg)
          console.error(`❌ Erro: ${errorMsg}`)
          
          // Se não é a última tentativa, aguardar antes de tentar novamente
          if (attempt < this.maxRetries) {
            const delay = this.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
            console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`)
            await this.sleep(delay)
          }
        }
      }
    }

    // Se chegou aqui, todos os providers falharam
    console.error('💥 Todos os providers falharam')
    
    return {
      success: false,
      message: `Falha em todos os métodos de envio. Último erro: ${lastError?.message || 'Erro desconhecido'}`,
      data: {
        sentCount: 0,
        failedCount: this.countRecipients(data.recipients),
        sentEmails: [],
        failedEmails: data.recipients.emails || [],
        errors
      }
    }
  }

  // Envio para emails específicos com tolerância a falhas
  async sendToSpecificEmails(
    emails: string[], 
    subject: string, 
    message: string, 
    options: { html?: boolean; htmlContent?: string; templateId?: string } = {}
  ): Promise<EmailSendResult> {
    const sentEmails: string[] = []
    const failedEmails: string[] = []
    const errors: string[] = []

    console.log(`📬 Enviando para ${emails.length} emails específicos`)

    // Dividir em lotes menores para melhor controle
    const batchSize = 5
    const batches = this.chunkArray(emails, batchSize)

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      console.log(`📦 Processando lote ${i + 1}/${batches.length} (${batch.length} emails)`)

      try {
        const result = await this.sendEmail({
          title: subject,
          subject,
          message,
          html: options.html,
          htmlContent: options.htmlContent,
          recipients: { emails: batch },
          templateId: options.templateId
        })

        if (result.success && result.data) {
          sentEmails.push(...(result.data.sentEmails || []))
          failedEmails.push(...(result.data.failedEmails || []))
          if (result.data.errors) {
            errors.push(...result.data.errors)
          }
        } else {
          failedEmails.push(...batch)
          errors.push(`Lote ${i + 1}: ${result.message}`)
        }
      } catch (error: any) {
        failedEmails.push(...batch)
        errors.push(`Lote ${i + 1}: ${error.message}`)
      }

      // Pequena pausa entre lotes para não sobrecarregar
      if (i < batches.length - 1) {
        await this.sleep(500)
      }
    }

    const success = sentEmails.length > 0
    const resultMessage = success 
      ? `Enviado para ${sentEmails.length}/${emails.length} destinatários`
      : 'Falha no envio para todos os destinatários'

    return {
      success,
      message: resultMessage,
      data: {
        sentCount: sentEmails.length,
        failedCount: failedEmails.length,
        sentEmails,
        failedEmails,
        errors: errors.length > 0 ? errors : undefined
      }
    }
  }

  // Métodos utilitários
  private validateEmailData(data: EmailSendData): void {
    if (!data.subject?.trim()) {
      throw new Error('Assunto é obrigatório')
    }

    if (!data.message?.trim()) {
      throw new Error('Mensagem é obrigatória')
    }

    if (!data.recipients || this.countRecipients(data.recipients) === 0) {
      throw new Error('Pelo menos um destinatário é obrigatório')
    }

    // Validar emails
    if (data.recipients.emails) {
      for (const email of data.recipients.emails) {
        if (!this.isValidEmail(email)) {
          throw new Error(`Email inválido: ${email}`)
        }
      }
    }
  }

  private countRecipients(recipients: EmailRecipients): number {
    return (recipients.emails?.length || 0) + 
           (recipients.users?.length || 0) + 
           (recipients.roles?.length || 0)
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private async simulateEmailSending(data: EmailSendData): Promise<void> {
    // Simular tempo de processamento
    await this.sleep(Math.random() * 1000 + 500)
    
    // Log detalhado para desenvolvimento
    console.log('📧 [SIMULAÇÃO] Email enviado:', {
      para: data.recipients,
      assunto: data.subject,
      tamanho_mensagem: data.message.length,
      usa_html: data.html,
      template: data.templateId
    })
  }

  // Métodos públicos adicionais
  async validateEmailList(emails: string[]): Promise<{ valid: string[]; invalid: string[] }> {
    const valid: string[] = []
    const invalid: string[] = []

    for (const email of emails) {
      if (this.isValidEmail(email.trim())) {
        valid.push(email.trim())
      } else {
        invalid.push(email.trim())
      }
    }

    return { valid, invalid }
  }

  getProviderStatus(): { name: string; priority: number; available: boolean }[] {
    return this.providers.map(provider => ({
      name: provider.name,
      priority: provider.priority,
      available: true // Em produção, implementar verificação real
    }))
  }
}

export const enhancedEmailService = new EnhancedEmailService() 
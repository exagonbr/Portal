import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { validateStoredToken } from '@/utils/token-validator'
import { EmailData } from '@/components/communications/EmailComposer'

interface UseEmailSenderReturn {
  sendEmail: (emailData: EmailData) => Promise<void>
  loading: boolean
  success: boolean
  error: string | null
  successMessage: string
}

export function useEmailSender(): UseEmailSenderReturn {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')

  const sendEmail = async (emailData: EmailData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('🔍 [useEmailSender] Enviando e-mail...')

      // Verificar autenticação
      const tokenValidation = validateStoredToken()
      if (!tokenValidation.isValid) {
        console.warn('⚠️ [useEmailSender] Token inválido:', tokenValidation.errors)
        throw new Error('Sessão expirada. Faça login novamente.')
      }

      // Validar dados antes do envio
      console.log('🔍 [useEmailSender] Dados do email recebidos:', {
        recipients: emailData.recipients,
        subject: emailData.subject,
        messageLength: emailData.message?.length || 0,
        iconType: emailData.iconType
      })

      if (!emailData.recipients || emailData.recipients.length === 0) {
        throw new Error('Nenhum destinatário foi selecionado')
      }

      // Validar formato dos emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const invalidEmails = emailData.recipients.filter(email => !emailRegex.test(email))
      if (invalidEmails.length > 0) {
        throw new Error(`Emails inválidos: ${invalidEmails.join(', ')}`)
      }

      // Preparar dados para envio
      const notificationData = {
        subject: emailData.subject,
        message: emailData.message,
        channel: 'EMAIL',
        type: 'info',
        category: 'administrative',
        priority: 'medium',
        html: emailData.useHtml || false,
        htmlContent: emailData.htmlContent || '',
        recipients: {
          emails: emailData.recipients
        }
      }

      // Enviar via API
      console.log('🔍 [useEmailSender] Dados sendo enviados:', notificationData)
      const response = await apiClient.post('/api/notifications/send', notificationData)
      
      if (response.success) {
        setSuccess(true)
        setSuccessMessage(`E-mail enviado com sucesso para ${emailData.recipients.length} destinatário(s)!`)
        
        // Limpar mensagem de sucesso após 5 segundos
        setTimeout(() => {
          setSuccess(false)
          setSuccessMessage('')
        }, 5000)
      } else {
        throw new Error(response.message || 'Erro ao enviar e-mail')
      }
    } catch (error: any) {
      console.log('❌ [useEmailSender] Erro ao enviar e-mail:', error)
      
      let errorMessage = 'Erro ao enviar e-mail'
      
      if (error?.message?.includes('401') || error?.status === 401) {
        console.log('🔐 [useEmailSender] Erro de autenticação detectado')
        errorMessage = 'Sessão expirada. Faça login novamente.'
      } else if (error?.response?.data?.message) {
        // Erro da API com mensagem específica
        errorMessage = error.response.data.message
      } else if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // Erros de validação
        const validationErrors = error.response.data.errors.map((err: any) => err.message).join(', ')
        errorMessage = `Erro de validação: ${validationErrors}`
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      setError(errorMessage)
      
      // Limpar erro após 8 segundos para dar tempo de ler mensagens mais longas
      setTimeout(() => {
        setError(null)
      }, 8000)
    } finally {
      setLoading(false)
    }
  }

  return {
    sendEmail,
    loading,
    success,
    error,
    successMessage
  }
}
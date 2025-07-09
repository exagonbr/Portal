import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'
import { notificationQueueService, CreateNotificationQueueDto } from '@/services/notificationqueueService'

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ 
        success: false,
        message: 'Não autorizado' 
      }, { 
        status: 401,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()

    // Validar canal de envio
    const channel = body.channel?.toUpperCase() || 'EMAIL'
    if (!['EMAIL', 'SMS', 'PUSH'].includes(channel)) {
      return NextResponse.json({
        success: false,
        message: 'Canal de notificação inválido. Use EMAIL, SMS ou PUSH'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar dados obrigatórios
    if (!body.subject && !body.title) {
      return NextResponse.json({
        success: false,
        message: 'Assunto é obrigatório'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Verificar se é um template ou mensagem direta
    let messageContent = ''
    let templateData = null

    if (body.templateId) {
      // Carregar template pelo ID
      templateData = await loadTemplate(body.templateId)
      
      if (!templateData) {
        return NextResponse.json({
          success: false,
          message: `Template com ID ${body.templateId} não encontrado`
        }, {
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        })
      }
      
      // Aplicar dados ao template
      messageContent = applyTemplateData(templateData.content, body.templateData || {})
    } else if (body.message) {
      // Usar mensagem direta
      messageContent = body.message
    } else {
      return NextResponse.json({
        success: false,
        message: 'É necessário fornecer uma mensagem ou um ID de template'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Extrair todos os destinatários dos diferentes tipos
    const recipients = await extractRecipients(body.recipients, channel)
    
    // Se não houver destinatários, retornar erro
    if (recipients.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum destinatário válido encontrado'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar destinatários de acordo com o canal
    const invalidRecipients = validateRecipients(recipients, channel)
    
    if (invalidRecipients.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Destinatários inválidos para ${channel}: ${invalidRecipients.join(', ')}`
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Criar objeto para a fila de notificações
    const notificationQueueItem: CreateNotificationQueueDto = {
      type: body.type || 'info',
      description: body.subject || body.title
    }

    // Adicionar à fila de notificações
    const queueResult = await notificationQueueService.create(notificationQueueItem)

    // Enviar notificação pelo canal apropriado
    const result = await sendNotification({
      channel,
      recipients,
      subject: body.subject || body.title,
      message: messageContent,
      html: body.html || (templateData?.isHtml ?? false),
      templateId: body.templateId,
      templateData: body.templateData,
      priority: body.priority || 'medium',
      category: body.category || channel.toLowerCase(),
      type: body.type || 'info',
      metadata: body.metadata || {}
    })

    // Criar registro da notificação enviada
    const notification = {
      id: queueResult.id || `notification_${Date.now()}`,
      title: body.subject || body.title,
      message: messageContent,
      type: body.type || 'info',
      category: body.category || channel.toLowerCase(),
      priority: body.priority || 'medium',
      sender_id: session.user?.email,
      sender_name: session.user?.name,
      recipients,
      recipient_count: recipients.length,
      channels: [channel],
      template_id: body.templateId || null,
      template_data: body.templateData || null,
      status: result.success ? 'sent' : 'failed',
      error: result.error || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: notification
    }, {
      status: result.success ? 200 : 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`❌ [Notification API] Erro ao enviar notificação:`, error)
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// Função para carregar um template pelo ID
async function loadTemplate(templateId: string) {
  // Aqui você buscaria o template no banco de dados
  
  // Simulação de templates
  const templates = {
    'welcome': {
      id: 'welcome',
      name: 'Boas-vindas',
      content: 'Olá {{name}}, bem-vindo ao nosso sistema!',
      isHtml: false
    },
    'password_reset': {
      id: 'password_reset',
      name: 'Redefinição de Senha',
      content: '<h1>Redefinição de Senha</h1><p>Olá {{name}},</p><p>Clique <a href="{{resetLink}}">aqui</a> para redefinir sua senha.</p>',
      isHtml: true
    },
    'notification': {
      id: 'notification',
      name: 'Notificação Geral',
      content: '{{message}}',
      isHtml: false
    }
  }
  
  // @ts-ignore - Simulação
  return templates[templateId] || null
}

// Função para aplicar dados a um template
function applyTemplateData(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return data[key] !== undefined ? data[key] : `{{${key}}}`
  })
}

// Função para extrair destinatários
async function extractRecipients(recipientsData: any, channel: string): Promise<string[]> {
  if (!recipientsData) return []
  
  const allRecipients: string[] = []
  
  // Destinatários diretos (emails, telefones, tokens)
  if (recipientsData.direct && Array.isArray(recipientsData.direct)) {
    allRecipients.push(...recipientsData.direct)
  }
  
  // IDs de usuários
  if (recipientsData.users && Array.isArray(recipientsData.users)) {
    // Aqui você buscaria os dados de contato dos usuários no banco de dados
    // Simulação: converter IDs de usuários para contatos
    const userContacts = await Promise.all(recipientsData.users.map(async (userId: string) => {
      // Simulação - aqui você buscaria no banco de dados
      return channel === 'EMAIL' ? `user_${userId}@example.com` :
             channel === 'SMS' ? `+55119${userId.padStart(8, '0')}` :
             channel === 'PUSH' ? `device_token_${userId}` : null
    }))
    
    allRecipients.push(...userContacts.filter(Boolean) as string[])
  }
  
  // Papéis/funções
  if (recipientsData.roles && Array.isArray(recipientsData.roles)) {
    // Aqui você buscaria todos os contatos dos usuários com esses papéis
    // Simulação: converter papéis para contatos
    for (const role of recipientsData.roles) {
      // Simulação - aqui você buscaria no banco de dados
      if (channel === 'EMAIL') {
        allRecipients.push(`${role}_group@example.com`)
      } else if (channel === 'SMS') {
        allRecipients.push(`+5511999${role.slice(0, 6)}`)
      } else if (channel === 'PUSH') {
        allRecipients.push(`group_token_${role}`)
      }
    }
  }
  
  // Remover duplicatas
  return Array.from(new Set(allRecipients))
}

// Função para validar destinatários de acordo com o canal
function validateRecipients(recipients: string[], channel: string): string[] {
  const invalidRecipients: string[] = []
  
  for (const recipient of recipients) {
    if (channel === 'EMAIL') {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(recipient)) {
        invalidRecipients.push(recipient)
      }
    } else if (channel === 'SMS') {
      // Validar formato de telefone (simplificado)
      const phoneRegex = /^\+\d{10,15}$/
      if (!phoneRegex.test(recipient)) {
        invalidRecipients.push(recipient)
      }
    } else if (channel === 'PUSH') {
      // Validar token de dispositivo (simplificado)
      if (recipient.length < 10) {
        invalidRecipients.push(recipient)
      }
    }
  }
  
  return invalidRecipients
}

// Função para enviar notificação pelo canal apropriado
async function sendNotification(params: {
  channel: string,
  recipients: string[],
  subject: string,
  message: string,
  html?: boolean,
  templateId?: string,
  templateData?: Record<string, any>,
  priority?: string,
  category?: string,
  type?: string,
  metadata?: Record<string, any>
}): Promise<{ success: boolean, message: string, error?: any }> {
  try {
    const { channel, recipients, subject, message } = params
    
    // Simular envio pelo canal apropriado
    switch (channel) {
      case 'EMAIL':
        // Integração com serviço de email (ex: SendGrid, AWS SES)
        break
        
      case 'SMS':
        // Integração com serviço de SMS (ex: Twilio, AWS SNS)
        break
        
      case 'PUSH':
        // Integração com serviço de notificações push (ex: Firebase Cloud Messaging)
        break
    }
    
    // Simular delay do envio
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      message: `Notificação enviada com sucesso para ${recipients.length} destinatário(s) via ${channel}`
    }
    
  } catch (error) {
    return {
      success: false,
      message: `Erro ao enviar notificação via ${params.channel}`,
      error
    }
  }
} 
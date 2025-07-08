import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

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
    console.log('📧 [Email Send API] Dados recebidos:', body)

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

    if (!body.message) {
      return NextResponse.json({
        success: false,
        message: 'Mensagem é obrigatória'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Extrair todos os emails dos diferentes tipos de destinatários
    const allEmails: string[] = []
    
    // Emails diretos
    if (body.recipients?.emails && Array.isArray(body.recipients.emails)) {
      allEmails.push(...body.recipients.emails)
    }
    
    // IDs de usuários (aqui você buscaria os emails desses usuários no banco de dados)
    if (body.recipients?.users && Array.isArray(body.recipients.users)) {
      // Simulação: converter IDs de usuários para emails
      const userEmails = body.recipients.users.map((userId: string) => `user_${userId}@example.com`)
      allEmails.push(...userEmails)
    }
    
    // Papéis/funções (aqui você buscaria todos os emails dos usuários com esses papéis)
    if (body.recipients?.roles && Array.isArray(body.recipients.roles)) {
      // Simulação: converter papéis para emails
      const roleEmails = body.recipients.roles.map((role: string) => `${role}_group@example.com`)
      allEmails.push(...roleEmails)
    }

    // Se não houver emails, retornar erro
    if (allEmails.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum destinatário válido encontrado'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = allEmails.filter((email: string) => !emailRegex.test(email))
    
    if (invalidEmails.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Emails inválidos: ${invalidEmails.join(', ')}`
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Simular envio de email (aqui você integraria com um serviço real de email)
    console.log('📧 [Email Send API] Simulando envio de email...')
    console.log('📧 [Email Send API] Destinatários:', allEmails)
    console.log('📧 [Email Send API] Assunto:', body.subject || body.title)
    console.log('📧 [Email Send API] Mensagem:', body.message)
    console.log('📧 [Email Send API] HTML:', body.html ? 'Sim' : 'Não')

    // Criar registro da notificação enviada
    const notification = {
      id: `email_${Date.now()}`,
      title: body.subject || body.title,
      message: body.message,
      type: body.type || 'info',
      category: body.category || 'email',
      priority: body.priority || 'medium',
      sender_id: session.user?.email,
      sender_name: session.user?.name,
      recipients: allEmails,
      recipient_count: allEmails.length,
      channels: ['EMAIL'],
      status: 'sent',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Aqui você salvaria no banco de dados
    console.log('📧 [Email Send API] Notificação criada:', notification)

    // Simular delay do envio
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      message: `Email enviado com sucesso para ${allEmails.length} destinatário(s)`,
      data: notification
    }, {
      status: 200,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ [Email Send API] Erro ao enviar email:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Erro interno do servidor' 
    }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
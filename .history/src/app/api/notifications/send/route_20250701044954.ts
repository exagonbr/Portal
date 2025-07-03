import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }
}

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(request.headers.get('origin') || undefined)
  })
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

    // Verificar permissões
    const userRole = session.user?.role;
    // Defensive: check if userRole is a string and matches expected roles
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'TEACHER'];
    const canSendNotifications = typeof userRole === 'string' && allowedRoles.includes(userRole);

    if (!canSendNotifications) {
      return NextResponse.json({ 
        success: false,
        message: 'Sem permissão para enviar notificações' 
      }, { 
        status: 403,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    const body = await request.json()
    console.log('📧 [Email Send API] Dados recebidos:', body)

    // Validar dados obrigatórios
    if (!body.title || !body.message) {
      return NextResponse.json({
        success: false,
        message: 'Título e mensagem são obrigatórios'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    if (!body.recipients?.emails || !Array.isArray(body.recipients.emails) || body.recipients.emails.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Lista de destinatários é obrigatória'
      }, {
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      })
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = body.recipients.emails.filter((email: string) => !emailRegex.test(email))
    
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
    console.log('📧 [Email Send API] Destinatários:', body.recipients.emails)
    console.log('📧 [Email Send API] Assunto:', body.title)
    console.log('📧 [Email Send API] Mensagem:', body.message)

    // Criar registro da notificação enviada
    const notification = {
      id: `email_${Date.now()}`,
      title: body.title,
      message: body.message,
      type: body.type || 'info',
      category: body.category || 'email',
      priority: body.priority || 'medium',
      iconType: body.iconType || 'email',
      sender_id: session.user?.email,
      sender_name: session.user?.name,
      recipients: body.recipients.emails,
      recipient_count: body.recipients.emails.length,
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
      message: `Email enviado com sucesso para ${body.recipients.emails.length} destinatário(s)`,
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
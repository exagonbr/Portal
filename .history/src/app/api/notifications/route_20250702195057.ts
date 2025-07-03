import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Schema de validação para criação de notificação
const createNotificationSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR', 'ANNOUNCEMENT', 'REMINDER', 'ASSIGNMENT', 'GRADE', 'MESSAGE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  recipient_type: z.enum(['USER', 'ROLE', 'CLASS', 'INSTITUTION', 'SCHOOL', 'ALL']),
  recipient_ids: z.array(z.string()).optional(),
  recipient_roles: z.array(z.string()).optional(),
  sender_type: z.enum(['SYSTEM', 'USER', 'AUTOMATED']).default('USER'),
  action_url: z.string().url().optional(),
  action_text: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  scheduled_for: z.string().datetime().optional(),
  metadata: z.object({
    entity_type: z.string().optional(),
    entity_id: z.string().optional(),
    additional_data: z.record(z.any()).optional()
  }).optional(),
  channels: z.array(z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH'])).default(['IN_APP']),
  settings: z.object({
    allow_dismiss: z.boolean().default(true),
    require_acknowledgment: z.boolean().default(false),
    auto_dismiss_seconds: z.number().int().positive().optional(),
    group_similar: z.boolean().default(true)
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockNotifications = new Map()
const mockUserNotifications = new Map() // Relação usuário-notificação

// GET - Listar notificações

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;
    const userNotificationIds = mockUserNotifications.get(userId) || [];
    
    const notifications = userNotificationIds.map((notifId: string) => {
        const notification = mockNotifications.get(notifId);
        if (!notification) return null;
        const userStatus = notification.user_statuses?.[userId] || { read: false };
        return { ...notification, ...userStatus };
      }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        items: notifications,
        pagination: {
          total: notifications.length,
        },
        unread_count: notifications.filter((n: any) => !n.read).length
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error: any) {
    console.error('Erro ao listar notificações:', error);
    return NextResponse.json({
        error: 'Erro interno do servidor',
        message: error.message
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// POST - Criar notificação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canSendNotifications = userRole && ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR', 'TEACHER'].includes(userRole)
    
    if (!canSendNotifications) {
      return NextResponse.json({ error: 'Sem permissão para enviar notificações' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createNotificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const notificationData = validationResult.data

    // Validar permissões específicas por tipo de destinatário
    if (notificationData.recipient_type === 'ALL' && userRole !== 'SYSTEM_ADMIN') {
      return NextResponse.json({ error: 'Apenas administradores do sistema podem enviar notificações para todos' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    if (notificationData.recipient_type === 'INSTITUTION' && userRole && !['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para enviar notificações para toda a instituição' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Determinar destinatários
    let recipientUserIds: string[] = []
    
    switch (notificationData.recipient_type) {
      case 'USER':
        recipientUserIds = notificationData.recipient_ids || []
        break
      case 'ROLE':
        // Buscar usuários por role
        // recipientUserIds = await getUsersByRoles(notificationData.recipient_roles)
        recipientUserIds = [] // Implementar lógica real
        break
      case 'CLASS':
        // Buscar alunos das turmas
        // recipientUserIds = await getStudentsByClasses(notificationData.recipient_ids)
        recipientUserIds = [] // Implementar lógica real
        break
      case 'INSTITUTION':
      case 'SCHOOL':
      case 'ALL':
        // Buscar usuários conforme escopo
        recipientUserIds = [] // Implementar lógica real
        break
    }

    // Criar notificação
    const newNotification = {
      id: `notif_${Date.now()}`,
      ...notificationData,
      sender_id: session.user?.id,
      sender_name: session.user?.name,
      recipient_count: recipientUserIds.length,
      user_statuses: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Inicializar status para cada destinatário
    recipientUserIds.forEach(userId => {
      (newNotification.user_statuses as any)[userId] = {
        read: false,
        read_at: null,
        archived: false,
        acknowledged: false
      }
      
      // Adicionar à lista de notificações do usuário
      const userNotifs = mockUserNotifications.get(userId) || []
      userNotifs.push(newNotification.id)
      mockUserNotifications.set(userId, userNotifs)
    })

    mockNotifications.set(newNotification.id, newNotification)

    // Se agendada, não enviar imediatamente
    if (notificationData.scheduled_for && new Date(notificationData.scheduled_for) > new Date()) {
      (newNotification as any).status = 'scheduled'
    } else {
      // Enviar por outros canais se configurado
      if (notificationData.channels.includes('EMAIL')) {
        // Enviar email
      }
      if (notificationData.channels.includes('PUSH')) {
        // Enviar push notification
      }
      if (notificationData.channels.includes('SMS')) {
        // Enviar SMS
      }
      (newNotification as any).status = 'sent'
    }

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notificação criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.log('Erro ao criar notificação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

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
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const status = searchParams.get('status') // unread, read, archived
    const from_date = searchParams.get('from_date')
    const to_date = searchParams.get('to_date')

    // Buscar notificações do usuário
    const userNotificationIds = mockUserNotifications.get(session.user?.id) || []
    let notifications = userNotificationIds.map((notifId: string) => {
      const notification = mockNotifications.get(notifId)
      if (!notification) return null
      
      // Adicionar status específico do usuário
      const userStatus = notification.user_statuses?.[session.user?.id] || {
        read: false,
        read_at: null,
        archived: false,
        acknowledged: false
      }
      
      return {
        ...notification,
        ...userStatus
      }
    }).filter(Boolean)

    // Aplicar filtros
    if (type) {
      notifications = notifications.filter((notif: any) => notif.type === type)
    }

    if (priority) {
      notifications = notifications.filter((notif: any) => notif.priority === priority)
    }

    if (status) {
      notifications = notifications.filter((notif: any) => {
        if (status === 'unread') return !notif.read
        if (status === 'read') return notif.read && !notif.archived
        if (status === 'archived') return notif.archived
        return true
      })
    }

    // Filtrar por período
    if (from_date || to_date) {
      notifications = notifications.filter((notif: any) => {
        const createdAt = new Date(notif.created_at)
        if (from_date && createdAt < new Date(from_date)) return false
        if (to_date && createdAt > new Date(to_date)) return false
        return true
      })
    }

    // Filtrar notificações expiradas
    const now = new Date()
    notifications = notifications.filter((notif: any) => 
      !notif.expires_at || new Date(notif.expires_at) > now
    )

    // Ordenar por prioridade e data
    notifications.sort((a: any, b: any) => {
      // Prioridade urgente primeiro
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
      if (priorityDiff !== 0) return priorityDiff
      
      // Depois por data (mais recente primeiro)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedNotifications = notifications.slice(startIndex, endIndex)

    // Contar notificações não lidas
    const unreadCount = notifications.filter((n: any) => !n.read).length

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: notifications.length,
          totalPages: Math.ceil(notifications.length / limit)
        },
        unread_count: unreadCount
      }
    })

  } catch (error) {
    console.error('Erro ao listar notificações:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar notificação
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canSendNotifications = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER'].includes(userRole)
    
    if (!canSendNotifications) {
      return NextResponse.json(
        { error: 'Sem permissão para enviar notificações' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createNotificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const notificationData = validationResult.data

    // Validar permissões específicas por tipo de destinatário
    if (notificationData.recipient_type === 'ALL' && userRole !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores do sistema podem enviar notificações para todos' },
        { status: 403 }
      )
    }

    if (notificationData.recipient_type === 'INSTITUTION' && !['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para enviar notificações para toda a instituição' },
        { status: 403 }
      )
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
    console.error('Erro ao criar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
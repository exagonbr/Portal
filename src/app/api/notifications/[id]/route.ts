import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de notificação
const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
  acknowledged: z.boolean().optional()
})

// Mock database - substituir por Prisma/banco real
const mockNotifications = new Map()
const mockUserNotifications = new Map()

// GET - Buscar notificação por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Buscar notificação
    const notification = mockNotifications.get(notificationId)

    if (!notification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é destinatário
    const userStatus = notification.user_statuses?.[session.user?.id]
    if (!userStatus && notification.sender_id !== session.user?.id) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta notificação' },
        { status: 403 }
      )
    }

    // Marcar como lida automaticamente ao visualizar
    if (userStatus && !userStatus.read) {
      userStatus.read = true
      userStatus.read_at = new Date().toISOString()
      notification.user_statuses[session.user?.id] = userStatus
      mockNotifications.set(notificationId, notification)
    }

    // Preparar resposta com status do usuário
    const notificationWithStatus = {
      ...notification,
      ...(userStatus || {}),
      is_sender: notification.sender_id === session.user?.id
    }

    // Remover informações sensíveis se não for o remetente
    if (!notificationWithStatus.is_sender) {
      delete notificationWithStatus.user_statuses
      delete notificationWithStatus.recipient_ids
    }

    return NextResponse.json({
      success: true,
      data: notificationWithStatus
    })

  } catch (error) {
    console.error('Erro ao buscar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar status da notificação
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const notificationId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateNotificationSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Buscar notificação existente
    const existingNotification = mockNotifications.get(notificationId)
    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se o usuário é destinatário
    const userStatus = existingNotification.user_statuses?.[session.user?.id]
    if (!userStatus) {
      return NextResponse.json(
        { error: 'Você não é destinatário desta notificação' },
        { status: 403 }
      )
    }

    // Atualizar status do usuário
    if (updateData.read !== undefined) {
      userStatus.read = updateData.read
      userStatus.read_at = updateData.read ? new Date().toISOString() : null
    }

    if (updateData.archived !== undefined) {
      userStatus.archived = updateData.archived
      userStatus.archived_at = updateData.archived ? new Date().toISOString() : null
    }

    if (updateData.acknowledged !== undefined) {
      // Verificar se a notificação requer acknowledgment
      if (!existingNotification.settings?.require_acknowledgment && updateData.acknowledged) {
        return NextResponse.json(
          { error: 'Esta notificação não requer confirmação de leitura' },
          { status: 400 }
        )
      }
      userStatus.acknowledged = updateData.acknowledged
      userStatus.acknowledged_at = updateData.acknowledged ? new Date().toISOString() : null
    }

    // Salvar alterações
    existingNotification.user_statuses[session.user?.id] = userStatus
    existingNotification.updated_at = new Date().toISOString()
    mockNotifications.set(notificationId, existingNotification)

    return NextResponse.json({
      success: true,
      data: {
        ...userStatus,
        notification_id: notificationId
      },
      message: 'Status da notificação atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover notificação (apenas para remetente ou admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const notificationId = params.id

    // Buscar notificação
    const existingNotification = mockNotifications.get(notificationId)
    if (!existingNotification) {
      return NextResponse.json(
        { error: 'Notificação não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões - apenas remetente ou admin pode deletar
    const canDelete = 
      session.user.role === 'SYSTEM_ADMIN' ||
      existingNotification.sender_id === session.user?.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta notificação' },
        { status: 403 }
      )
    }

    // Remover notificação das listas de usuários
    Object.keys(existingNotification.user_statuses || {}).forEach(userId => {
      const userNotifs = mockUserNotifications.get(userId) || []
      const filteredNotifs = userNotifs.filter((id: string) => id !== notificationId)
      mockUserNotifications.set(userId, filteredNotifs)
    })

    // Deletar notificação
    mockNotifications.delete(notificationId)

    return NextResponse.json({
      success: true,
      message: 'Notificação removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar notificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
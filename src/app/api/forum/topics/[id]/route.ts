import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de tópico
const updateTopicSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200).optional(),
  content: z.string().min(20, 'Conteúdo deve ter pelo menos 20 caracteres').optional(),
  tags: z.array(z.string()).max(5, 'Máximo de 5 tags').optional(),
  type: z.enum(['QUESTION', 'DISCUSSION', 'ANNOUNCEMENT', 'TUTORIAL', 'RESOURCE']).optional(),
  visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY', 'CLASS_ONLY', 'PRIVATE']).optional(),
  is_pinned: z.boolean().optional(),
  is_locked: z.boolean().optional(),
  is_solved: z.boolean().optional(),
  allow_replies: z.boolean().optional(),
  attachments: z.array(z.object({
    type: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'LINK']),
    url: z.string().url(),
    title: z.string(),
    size_bytes: z.number().optional()
  })).optional()
})

// Mock database - substituir por Prisma/banco real
const mockTopics = new Map()
const mockCategories = new Map()

// GET - Buscar tópico por ID
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

    const topicId = params.id

    // Buscar tópico
    const topic = mockTopics.get(topicId)

    if (!topic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões de visualização
    const userRole = session.user.role
    const canView = 
      topic.visibility === 'PUBLIC' ||
      (topic.visibility === 'MEMBERS_ONLY' && session.user) ||
      (topic.visibility === 'CLASS_ONLY' && topic.class_id) || // Verificar se está na turma
      (topic.visibility === 'PRIVATE' && (topic.author_id === session.user.id || userRole === 'SYSTEM_ADMIN'))

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este tópico' },
        { status: 403 }
      )
    }

    // Incrementar contador de visualizações
    topic.view_count = (topic.view_count || 0) + 1
    topic.unique_viewers = topic.unique_viewers || []
    if (!topic.unique_viewers.includes(session.user.id)) {
      topic.unique_viewers.push(session.user.id)
    }
    mockTopics.set(topicId, topic)

    // Buscar informações da categoria
    const category = mockCategories.get(topic.category_id)

    // Preparar resposta com informações extras
    const topicWithDetails = {
      ...topic,
      category_name: category?.name || 'Geral',
      category_slug: category?.slug,
      is_author: topic.author_id === session.user.id,
      is_following: topic.followers?.includes(session.user.id) || false,
      has_voted: topic.poll?.voters?.includes(session.user.id) || false,
      can_edit: topic.author_id === session.user.id || ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole),
      can_delete: topic.author_id === session.user.id || userRole === 'SYSTEM_ADMIN',
      can_pin: ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole),
      can_lock: ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole),
      can_mark_solved: topic.type === 'QUESTION' && (topic.author_id === session.user.id || ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole)),
      time_ago: getTimeAgo(new Date(topic.created_at)),
      reading_time: Math.ceil(topic.content.split(' ').length / 200) // minutos
    }

    // Se tem enquete, adicionar resultados
    if (topic.poll) {
      const totalVotes = topic.poll.votes?.reduce((sum: number, v: any) => sum + v.count, 0) || 0
      topicWithDetails.poll.results = topic.poll.options.map((option: string, index: number) => ({
        option,
        votes: topic.poll.votes?.[index]?.count || 0,
        percentage: totalVotes > 0 ? ((topic.poll.votes?.[index]?.count || 0) / totalVotes * 100).toFixed(1) : '0'
      }))
      topicWithDetails.poll.total_votes = totalVotes
      topicWithDetails.poll.user_vote = topic.poll.user_votes?.[session.user.id] || null
    }

    return NextResponse.json({
      success: true,
      data: topicWithDetails
    })

  } catch (error) {
    console.error('Erro ao buscar tópico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar tópico
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

    const topicId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateTopicSchema.safeParse(body)
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

    // Buscar tópico existente
    const existingTopic = mockTopics.get(topicId)
    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const isAuthor = existingTopic.author_id === session.user.id
    const isAdmin = userRole === 'SYSTEM_ADMIN'
    const isTeacher = userRole === 'TEACHER'

    // Permissões básicas de edição
    if (!isAuthor && !isAdmin && !isTeacher) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este tópico' },
        { status: 403 }
      )
    }

    // Apenas admins e professores podem fixar/trancar tópicos
    if ((updateData.is_pinned !== undefined || updateData.is_locked !== undefined) && 
        !isAdmin && !isTeacher) {
      return NextResponse.json(
        { error: 'Sem permissão para fixar ou trancar tópicos' },
        { status: 403 }
      )
    }

    // Apenas autor, admin ou professor podem marcar como resolvido
    if (updateData.is_solved !== undefined && existingTopic.type === 'QUESTION') {
      if (!isAuthor && !isAdmin && !isTeacher) {
        return NextResponse.json(
          { error: 'Sem permissão para marcar como resolvido' },
          { status: 403 }
        )
      }
    }

    // Não permitir edição se tópico estiver trancado (exceto admins)
    if (existingTopic.is_locked && !isAdmin) {
      return NextResponse.json(
        { error: 'Tópico está trancado e não pode ser editado' },
        { status: 403 }
      )
    }

    // Atualizar tópico
    const updatedTopic = {
      ...existingTopic,
      ...updateData,
      updated_at: new Date().toISOString(),
      edited_by: session.user.id,
      edited_at: new Date().toISOString(),
      edit_count: (existingTopic.edit_count || 0) + 1
    }

    mockTopics.set(topicId, updatedTopic)

    return NextResponse.json({
      success: true,
      data: updatedTopic,
      message: 'Tópico atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar tópico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover tópico
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

    const topicId = params.id

    // Buscar tópico
    const existingTopic = mockTopics.get(topicId)
    if (!existingTopic) {
      return NextResponse.json(
        { error: 'Tópico não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      (existingTopic.author_id === session.user.id && existingTopic.reply_count === 0)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este tópico' },
        { status: 403 }
      )
    }

    // Não permitir deletar tópicos com muitas respostas (preservar discussões)
    if (existingTopic.reply_count > 5 && userRole !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Tópicos com muitas respostas não podem ser deletados. Entre em contato com um administrador.' },
        { status: 409 }
      )
    }

    // Atualizar estatísticas da categoria
    const category = mockCategories.get(existingTopic.category_id)
    if (category) {
      category.topic_count = Math.max(0, (category.topic_count || 0) - 1)
      mockCategories.set(existingTopic.category_id, category)
    }

    // Deletar tópico (em produção, seria soft delete)
    mockTopics.delete(topicId)

    return NextResponse.json({
      success: true,
      message: 'Tópico removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar tópico:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Função auxiliar para calcular tempo decorrido
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'agora'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`
  
  return date.toLocaleDateString('pt-BR')
} 
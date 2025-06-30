import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}
// Schema de validação para criação de tópico
const createTopicSchema = z.object({
  title: z.string().min(5, 'Título deve ter pelo menos 5 caracteres').max(200),
  content: z.string().min(20, 'Conteúdo deve ter pelo menos 20 caracteres'),
  category_id: z.string().uuid('ID de categoria inválido'),
  tags: z.array(z.string()).max(5, 'Máximo de 5 tags').optional(),
  type: z.enum(['QUESTION', 'DISCUSSION', 'ANNOUNCEMENT', 'TUTORIAL', 'RESOURCE']).default('DISCUSSION'),
  visibility: z.enum(['PUBLIC', 'MEMBERS_ONLY', 'CLASS_ONLY', 'PRIVATE']).default('PUBLIC'),
  class_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  is_pinned: z.boolean().default(false),
  is_locked: z.boolean().default(false),
  allow_replies: z.boolean().default(true),
  attachments: z.array(z.object({
    type: z.enum(['IMAGE', 'DOCUMENT', 'VIDEO', 'LINK']),
    url: z.string().url(),
    title: z.string(),
    size_bytes: z.number().optional()
  })).optional(),
  poll: z.object({
    question: z.string(),
    options: z.array(z.string()).min(2).max(10),
    allow_multiple: z.boolean().default(false),
    expires_at: z.string().datetime().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockTopics = new Map()
const mockCategories = new Map()

// GET - Listar tópicos

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category_id = searchParams.get('category_id')
    const type = searchParams.get('type')
    const class_id = searchParams.get('class_id')
    const course_id = searchParams.get('course_id')
    const user_id = searchParams.get('user_id')
    const tags = searchParams.get('tags')?.split(',')
    const sort = searchParams.get('sort') || 'recent' // recent, popular, unanswered
    const filter = searchParams.get('filter') // my_topics, following, solved

    // Buscar tópicos (substituir por query real)
    let topics = Array.from(mockTopics.values())

    // Aplicar filtros de visibilidade baseados no role
    const userRole = session.user?.role
    topics = topics.filter(topic => {
      if (topic.visibility === 'PUBLIC') return true
      if (topic.visibility === 'MEMBERS_ONLY' && session.user) return true
      if (topic.visibility === 'CLASS_ONLY' && topic.class_id) {
        // Verificar se usuário pertence à turma
        return true // Implementar verificação real
      }
      if (topic.visibility === 'PRIVATE') {
        return topic.author_id === session.user?.id || userRole === 'SYSTEM_ADMIN'
      }
      return false
    })

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      topics = topics.filter(topic => 
        topic.title.toLowerCase().includes(searchLower) ||
        topic.content.toLowerCase().includes(searchLower) ||
        topic.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    if (category_id) {
      topics = topics.filter(topic => topic.category_id === category_id)
    }

    if (type) {
      topics = topics.filter(topic => topic.type === type)
    }

    if (class_id) {
      topics = topics.filter(topic => topic.class_id === class_id)
    }

    if (course_id) {
      topics = topics.filter(topic => topic.course_id === course_id)
    }

    if (user_id) {
      topics = topics.filter(topic => topic.author_id === user_id)
    }

    if (tags && tags.length > 0) {
      topics = topics.filter(topic => 
        tags.some(tag => topic.tags?.includes(tag))
      )
    }

    if (filter) {
      switch (filter) {
        case 'my_topics':
          topics = topics.filter(topic => topic.author_id === session.user?.id)
          break
        case 'following':
          // Filtrar por tópicos seguidos
          topics = topics.filter(topic => topic.followers?.includes(session.user?.id))
          break
        case 'solved':
          topics = topics.filter(topic => topic.is_solved)
          break
        case 'unanswered':
          topics = topics.filter(topic => topic.reply_count === 0)
          break
      }
    }

    // Adicionar informações extras
    const topicsWithInfo = topics.map(topic => ({
      ...topic,
      author_name: topic.author_name || 'Usuário',
      category_name: mockCategories.get(topic.category_id)?.name || 'Geral',
      is_author: topic.author_id === session.user?.id,
      is_following: topic.followers?.includes(session.user?.id) || false,
      has_voted: topic.poll?.voters?.includes(session.user?.id) || false,
      can_edit: topic.author_id === session.user?.id || ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole),
      can_delete: topic.author_id === session.user?.id || userRole === 'SYSTEM_ADMIN',
      can_pin: ['SYSTEM_ADMIN', 'TEACHER'].includes(userRole),
      time_ago: getTimeAgo(new Date(topic.created_at))
    }))

    // Ordenar
    switch (sort) {
      case 'popular':
        topicsWithInfo.sort((a, b) => (b.view_count + b.reply_count * 2) - (a.view_count + a.reply_count * 2))
        break
      case 'unanswered':
        topicsWithInfo.sort((a, b) => {
          if (a.reply_count === 0 && b.reply_count > 0) return -1
          if (a.reply_count > 0 && b.reply_count === 0) return 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
      case 'recent':
      default:
        topicsWithInfo.sort((a, b) => 
          new Date(b.last_activity_at || b.created_at).getTime() - 
          new Date(a.last_activity_at || a.created_at).getTime()
        )
    }

    // Colocar tópicos fixados no topo
    const pinnedTopics = topicsWithInfo.filter(t => t.is_pinned)
    const regularTopics = topicsWithInfo.filter(t => !t.is_pinned)
    const sortedTopics = [...pinnedTopics, ...regularTopics]

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedTopics = sortedTopics.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedTopics,
        pagination: {
          page,
          limit,
          total: sortedTopics.length,
          totalPages: Math.ceil(sortedTopics.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar tópicos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar tópico
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createTopicSchema.safeParse(body)
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

    const topicData = validationResult.data

    // Verificar se categoria existe
    const category = mockCategories.get(topicData.category_id)
    if (!category) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões especiais
    const userRole = session.user?.role
    
    // Apenas professores e admins podem criar anúncios
    if (topicData.type === 'ANNOUNCEMENT' && !['SYSTEM_ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para criar anúncios' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Apenas professores e admins podem fixar tópicos
    if (topicData.is_pinned && !['SYSTEM_ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para fixar tópicos' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se for tópico de turma, verificar se usuário tem acesso
    if (topicData.class_id) {
      // Implementar verificação se usuário pertence à turma
      // Por enquanto, permitir
    }

    // Criar tópico
    const newTopic = {
      id: `topic_${Date.now()}`,
      ...topicData,
      author_id: session.user?.id,
      author_name: session.user?.name,
      author_avatar: session.user?.image,
      view_count: 0,
      reply_count: 0,
      like_count: 0,
      followers: [session.user?.id], // Autor segue automaticamente
      is_solved: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    }

    mockTopics.set(newTopic.id, newTopic)

    // Atualizar estatísticas da categoria
    if (category) {
      category.topic_count = (category.topic_count || 0) + 1
      category.last_topic_id = newTopic.id
      category.last_topic_at = new Date().toISOString()
      mockCategories.set(topicData.category_id, category)
    }

    return NextResponse.json({
      success: true,
      data: newTopic,
      message: 'Tópico criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar tópico:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
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

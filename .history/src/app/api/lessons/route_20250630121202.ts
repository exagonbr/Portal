import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

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

// Schema de validação para criação de aula
const createLessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  unit_id: z.string().uuid('ID de unidade inválido'),
  class_id: z.string().uuid('ID de turma inválido'),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0'),
  type: z.enum(['LIVE', 'RECORDED', 'HYBRID', 'SELF_PACED']),
  duration_minutes: z.number().int().positive('Duração deve ser positiva'),
  scheduled_date: z.string().datetime().optional(),
  meeting_url: z.string().url().optional(),
  recording_url: z.string().url().optional(),
  is_active: z.boolean().default(true),
  is_published: z.boolean().default(false),
  content: z.object({
    objectives: z.array(z.string()).optional(),
    materials: z.array(z.object({
      type: z.enum(['VIDEO', 'PDF', 'SLIDE', 'DOCUMENT', 'LINK', 'EXERCISE']),
      title: z.string(),
      url: z.string().url(),
      description: z.string().optional(),
      order: z.number().int().positive()
    })).optional(),
    activities: z.array(z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(['INDIVIDUAL', 'GROUP', 'DISCUSSION']),
      duration_minutes: z.number().int().positive(),
      points: z.number().int().min(0).optional()
    })).optional()
  }).optional(),
  attendance: z.object({
    required: z.boolean().default(true),
    min_duration_percent: z.number().min(0).max(100).default(75)
  }).optional(),
  settings: z.object({
    allow_late_submission: z.boolean().default(false),
    enable_chat: z.boolean().default(true),
    enable_recording: z.boolean().default(true),
    max_participants: z.number().int().positive().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockLessons = new Map()

// GET - Listar aulas

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
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const unit_id = searchParams.get('unit_id')
    const class_id = searchParams.get('class_id')
    const type = searchParams.get('type')
    const is_active = searchParams.get('is_active')
    const is_published = searchParams.get('is_published')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    // Buscar aulas (substituir por query real)
    let lessons = Array.from(mockLessons.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'TEACHER') {
      // Professor vê apenas aulas das turmas que leciona
      // Implementar lógica de verificação
    } else if (userRole === 'STUDENT') {
      // Aluno vê apenas aulas publicadas das turmas matriculadas
      lessons = lessons.filter(lesson => 
        lesson.is_published && 
        lesson.is_active
        // && verificar se está matriculado na turma
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      lessons = lessons.filter(lesson => 
        lesson.title.toLowerCase().includes(searchLower) ||
        (lesson.description && lesson.description.toLowerCase().includes(searchLower))
      )
    }

    if (unit_id) {
      lessons = lessons.filter(lesson => lesson.unit_id === unit_id)
    }

    if (class_id) {
      lessons = lessons.filter(lesson => lesson.class_id === class_id)
    }

    if (type) {
      lessons = lessons.filter(lesson => lesson.type === type)
    }

    if (is_active !== null) {
      lessons = lessons.filter(lesson => lesson.is_active === (is_active === 'true'))
    }

    if (is_published !== null) {
      lessons = lessons.filter(lesson => lesson.is_published === (is_published === 'true'))
    }

    // Filtrar por período
    if (start_date || end_date) {
      lessons = lessons.filter(lesson => {
        if (!lesson.scheduled_date) return false
        const lessonDate = new Date(lesson.scheduled_date)
        if (start_date && lessonDate < new Date(start_date)) return false
        if (end_date && lessonDate > new Date(end_date)) return false
        return true
      })
    }

    // Ordenar por data agendada e ordem
    lessons.sort((a, b) => {
      if (a.scheduled_date && b.scheduled_date) {
        const dateCompare = new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
        if (dateCompare !== 0) return dateCompare
      }
      return a.order - b.order
    })

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedLessons = lessons.slice(startIndex, endIndex)

    // Adicionar informações extras
    const lessonsWithInfo = paginatedLessons.map(lesson => ({
      ...lesson,
      attendance_count: lesson.attendance_count || 0,
      completion_rate: lesson.completion_rate || 0,
      average_score: lesson.average_score || 0,
      is_upcoming: lesson.scheduled_date && new Date(lesson.scheduled_date) > new Date(),
      is_live: lesson.type === 'LIVE' && lesson.is_live || false
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: lessonsWithInfo,
        pagination: {
          page,
          limit,
          total: lessons.length,
          totalPages: Math.ceil(lessons.length / limit)
        }
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao listar aulas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar aula
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
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para criar aulas' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createLessonSchema.safeParse(body)
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

    const lessonData = validationResult.data

    // Verificar se a ordem já existe na unidade
    const existingOrder = Array.from(mockLessons.values()).find(
      lesson => lesson.unit_id === lessonData.unit_id && 
                lesson.order === lessonData.order
    )

    if (existingOrder) {
      return NextResponse.json({ error: 'Já existe uma aula com esta ordem nesta unidade' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se for professor, verificar se tem permissão na turma
    if (userRole === 'TEACHER') {
      // Implementar verificação se o professor leciona na turma
      // Por enquanto, permitir
    }

    // Validar data agendada para aulas ao vivo
    if (lessonData.type === 'LIVE' && !lessonData.scheduled_date) {
      return NextResponse.json({ error: 'Data agendada é obrigatória para aulas ao vivo' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Criar aula
    const newLesson = {
      id: `lesson_${Date.now()}`,
      ...lessonData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockLessons.set(newLesson.id, newLesson)

    return NextResponse.json({
      success: true,
      data: newLesson,
      message: 'Aula criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar aula:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'

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

// Schema de validação para criação de tarefa
const createAssignmentSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  lesson_id: z.string().uuid('ID de aula inválido'),
  class_id: z.string().uuid('ID de turma inválido'),
  type: z.enum(['HOMEWORK', 'PROJECT', 'ESSAY', 'PRESENTATION', 'EXAM', 'QUIZ', 'RESEARCH']),
  points: z.number().int().min(0, 'Pontos devem ser positivos'),
  due_date: z.string().datetime(),
  available_from: z.string().datetime().optional(),
  instructions: z.string().optional(),
  rubric: z.array(z.object({
    criteria: z.string(),
    description: z.string(),
    points: z.number().int().min(0)
  })).optional(),
  attachments: z.array(z.object({
    type: z.enum(['FILE', 'LINK', 'VIDEO']),
    title: z.string(),
    url: z.string().url(),
    description: z.string().optional()
  })).optional(),
  submission_type: z.enum(['FILE_UPLOAD', 'TEXT_ENTRY', 'URL', 'MEDIA_RECORDING', 'MULTIPLE']),
  allowed_file_types: z.array(z.string()).optional(),
  max_file_size_mb: z.number().int().positive().default(10),
  attempts_allowed: z.number().int().positive().default(1),
  group_assignment: z.boolean().default(false),
  group_size: z.number().int().min(2).optional(),
  peer_review: z.boolean().default(false),
  peer_review_count: z.number().int().min(1).optional(),
  is_published: z.boolean().default(false),
  settings: z.object({
    late_submission_allowed: z.boolean().default(false),
    late_penalty_percent: z.number().min(0).max(100).optional(),
    plagiarism_check: z.boolean().default(true),
    anonymous_grading: z.boolean().default(false),
    show_grade_immediately: z.boolean().default(false)
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockAssignments = new Map()

// GET - Listar tarefas

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
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
    const lesson_id = searchParams.get('lesson_id')
    const class_id = searchParams.get('class_id')
    const type = searchParams.get('type')
    const status = searchParams.get('status') // pending, submitted, graded
    const is_published = searchParams.get('is_published')
    const due_date_from = searchParams.get('due_date_from')
    const due_date_to = searchParams.get('due_date_to')

    // Buscar tarefas (substituir por query real)
    let assignments = Array.from(mockAssignments.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'TEACHER') {
      // Professor vê apenas tarefas das turmas que leciona
      // Implementar lógica de verificação
    } else if (userRole === 'STUDENT') {
      // Aluno vê apenas tarefas publicadas das turmas matriculadas
      assignments = assignments.filter(assignment => 
        assignment.is_published && 
        // verificar se está matriculado na turma
        true
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      assignments = assignments.filter(assignment => 
        assignment.title.toLowerCase().includes(searchLower) ||
        assignment.description.toLowerCase().includes(searchLower)
      )
    }

    if (lesson_id) {
      assignments = assignments.filter(assignment => assignment.lesson_id === lesson_id)
    }

    if (class_id) {
      assignments = assignments.filter(assignment => assignment.class_id === class_id)
    }

    if (type) {
      assignments = assignments.filter(assignment => assignment.type === type)
    }

    if (is_published !== null) {
      assignments = assignments.filter(assignment => assignment.is_published === (is_published === 'true'))
    }

    // Filtrar por período de entrega
    if (due_date_from || due_date_to) {
      assignments = assignments.filter(assignment => {
        const dueDate = new Date(assignment.due_date)
        if (due_date_from && dueDate < new Date(due_date_from)) return false
        if (due_date_to && dueDate > new Date(due_date_to)) return false
        return true
      })
    }

    // Para alunos, adicionar status da tarefa
    if (userRole === 'STUDENT' && status) {
      assignments = assignments.filter(assignment => {
        // Simular status baseado em submissões
        const userSubmission = assignment.submissions?.find((s: any) => s.student_id === session.user?.id)
        if (status === 'pending' && !userSubmission) return true
        if (status === 'submitted' && userSubmission && !userSubmission.grade) return true
        if (status === 'graded' && userSubmission && userSubmission.grade) return true
        return false
      })
    }

    // Ordenar por data de entrega
    assignments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedAssignments = assignments.slice(startIndex, endIndex)

    // Adicionar informações extras
    const assignmentsWithInfo = paginatedAssignments.map(assignment => {
      const now = new Date()
      const dueDate = new Date(assignment.due_date)
      
      const info: any = {
        ...assignment,
        submissions_count: assignment.submissions?.length || 0,
        graded_count: assignment.submissions?.filter((s: any) => s.grade).length || 0,
        average_grade: assignment.average_grade || 0,
        is_overdue: dueDate < now,
        days_until_due: Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Para alunos, adicionar informações pessoais
      if (userRole === 'STUDENT') {
        const userSubmission = assignment.submissions?.find((s: any) => s.student_id === session.user?.id)
        info.user_submission = userSubmission || null
        info.user_status = userSubmission ? (userSubmission.grade ? 'graded' : 'submitted') : 'pending'
      }

      return info
    })

    return NextResponse.json({
      success: true,
      data: {
        items: assignmentsWithInfo,
        pagination: {
          page,
          limit,
          total: assignments.length,
          totalPages: Math.ceil(assignments.length / limit)
        }
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao listar tarefas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar tarefa
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'])) {
      return NextResponse.json({ error: 'Sem permissão para criar tarefas' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createAssignmentSchema.safeParse(body)
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

    const assignmentData = validationResult.data

    // Validar datas
    const now = new Date()
    const dueDate = new Date(assignmentData.due_date)
    const availableFrom = assignmentData.available_from ? new Date(assignmentData.available_from) : now

    if (dueDate <= now) {
      return NextResponse.json({ error: 'Data de entrega deve ser futura' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    if (availableFrom > dueDate) {
      return NextResponse.json({ error: 'Data de disponibilidade deve ser anterior à data de entrega' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Validar configurações de grupo
    if (assignmentData.group_assignment && !assignmentData.group_size) {
      return NextResponse.json({ error: 'Tamanho do grupo é obrigatório para tarefas em grupo' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Validar configurações de revisão por pares
    if (assignmentData.peer_review && !assignmentData.peer_review_count) {
      return NextResponse.json({ error: 'Número de revisões é obrigatório para revisão por pares' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se for professor, verificar se tem permissão na turma
    if (userRole === 'TEACHER') {
      // Implementar verificação se o professor leciona na turma
      // Por enquanto, permitir
    }

    // Criar tarefa
    const newAssignment = {
      id: `assignment_${Date.now()}`,
      ...assignmentData,
      submissions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockAssignments.set(newAssignment.id, newAssignment)

    return NextResponse.json({
      success: true,
      data: newAssignment,
      message: 'Tarefa criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 

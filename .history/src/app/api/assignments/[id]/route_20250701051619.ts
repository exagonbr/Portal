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

// Schema de validação para atualização de tarefa
const updateAssignmentSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').optional(),
  type: z.enum(['HOMEWORK', 'PROJECT', 'ESSAY', 'PRESENTATION', 'EXAM', 'QUIZ', 'RESEARCH']).optional(),
  points: z.number().int().min(0, 'Pontos devem ser positivos').optional(),
  due_date: z.string().datetime().optional(),
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
  submission_type: z.enum(['FILE_UPLOAD', 'TEXT_ENTRY', 'URL', 'MEDIA_RECORDING', 'MULTIPLE']).optional(),
  allowed_file_types: z.array(z.string()).optional(),
  max_file_size_mb: z.number().int().positive().optional(),
  attempts_allowed: z.number().int().positive().optional(),
  group_assignment: z.boolean().optional(),
  group_size: z.number().int().min(2).optional(),
  peer_review: z.boolean().optional(),
  peer_review_count: z.number().int().min(1).optional(),
  is_published: z.boolean().optional(),
  settings: z.object({
    late_submission_allowed: z.boolean().optional(),
    late_penalty_percent: z.number().min(0).max(100).optional(),
    plagiarism_check: z.boolean().optional(),
    anonymous_grading: z.boolean().optional(),
    show_grade_immediately: z.boolean().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockAssignments = new Map()

// GET - Buscar tarefa por ID

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const params = await context.params
    const assignmentId = params.id

    // Buscar tarefa
    const assignment = mockAssignments.get(assignmentId)

    if (!assignment) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canViewDetails =
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      userRole === 'TEACHER' ||
      (userRole === 'STUDENT' && assignment.is_published)

    if (!canViewDetails) {
      return NextResponse.json({ error: 'Sem permissão para visualizar esta tarefa' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Adicionar informações específicas do usuário
    let assignmentWithUserInfo = { ...assignment }
    
    const now = new Date()
    const dueDate = new Date(assignment.due_date)
    
    assignmentWithUserInfo.is_overdue = dueDate < now
    assignmentWithUserInfo.days_until_due = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (userRole === 'STUDENT') {
      // Buscar submissão do aluno
      const userSubmission = assignment.submissions?.find((s: any) => s.student_id === session.user?.id)
      assignmentWithUserInfo.user_submission = userSubmission || null
      assignmentWithUserInfo.user_status = userSubmission ? (userSubmission.grade ? 'graded' : 'submitted') : 'pending'
      assignmentWithUserInfo.can_submit = !assignment.is_overdue || assignment.settings?.late_submission_allowed
      
      // Remover submissões de outros alunos
      delete assignmentWithUserInfo.submissions
    } else if (userRole === 'TEACHER') {
      // Adicionar estatísticas para professor
      assignmentWithUserInfo.submissions_count = assignment.submissions?.length || 0
      assignmentWithUserInfo.graded_count = assignment.submissions?.filter((s: any) => s.grade).length || 0
      assignmentWithUserInfo.pending_count = assignmentWithUserInfo.submissions_count - assignmentWithUserInfo.graded_count
    }

    return NextResponse.json({
      success: true,
      data: assignmentWithUserInfo
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao buscar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar tarefa
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const params = await context.params
    const assignmentId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateAssignmentSchema.safeParse(body)
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

    const updateData = validationResult.data

    // Buscar tarefa existente
    const existingAssignment = mockAssignments.get(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit =
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      (userRole === 'TEACHER' && existingAssignment.created_by === session.user?.id)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar esta tarefa' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Validar datas se estiverem sendo alteradas
    if (updateData.due_date || updateData.available_from) {
      const dueDate = updateData.due_date ? new Date(updateData.due_date) : new Date(existingAssignment.due_date)
      const availableFrom = updateData.available_from ? new Date(updateData.available_from) : 
                           (existingAssignment.available_from ? new Date(existingAssignment.available_from) : null)

      if (availableFrom && availableFrom > dueDate) {
        return NextResponse.json({ error: 'Data de disponibilidade deve ser anterior à data de entrega' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Não permitir certas alterações se já houver submissões
    if (existingAssignment.submissions && existingAssignment.submissions.length > 0) {
      const restrictedFields = ['points', 'rubric', 'submission_type', 'group_assignment']
      const hasRestrictedChanges = restrictedFields.some(field => (updateData as any)[field] !== undefined)
      
      if (hasRestrictedChanges) {
        return NextResponse.json({ error: 'Não é possível alterar configurações estruturais após receber submissões' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Atualizar tarefa
    const updatedAssignment = {
      ...existingAssignment,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockAssignments.set(assignmentId, updatedAssignment)

    return NextResponse.json({
      success: true,
      data: updatedAssignment,
      message: 'Tarefa atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao atualizar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover tarefa
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const params = await context.params
    const assignmentId = params.id

    // Buscar tarefa
    const existingAssignment = mockAssignments.get(assignmentId)
    if (!existingAssignment) {
      return NextResponse.json({ error: 'Tarefa não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete =
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      (userRole === 'TEACHER' && existingAssignment.created_by === session.user?.id)

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar esta tarefa' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Não permitir deletar se houver submissões
    if (existingAssignment.submissions && existingAssignment.submissions.length > 0) {
      return NextResponse.json({ error: 'Não é possível deletar tarefa com submissões. Archive a tarefa ao invés de deletar.' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Deletar tarefa (em produção, seria soft delete)
    mockAssignments.delete(assignmentId)

    return NextResponse.json({
      success: true,
      message: 'Tarefa removida com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao deletar tarefa:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
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
// Schema de validação para atualização de curso
const updateCourseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  level: z.enum(['FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO']).optional(),
  duration_months: z.number().int().positive('Duração deve ser positiva').optional(),
  is_active: z.boolean().optional(),
  code: z.string().optional(),
  workload_hours: z.number().int().positive().optional(),
  modality: z.enum(['PRESENCIAL', 'EAD', 'HIBRIDO']).optional()
})

// Mock database - substituir por Prisma/banco real
const mockCourses = new Map()

// GET - Buscar curso por ID

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id

    // Buscar curso
    const course = mockCourses.get(id)

    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões de visualização
    const userRole = session.user?.role
    const canView =
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_MANAGER' && course.institution_id === session.user.institution_id) ||
      (userRole === 'COORDINATOR' && course.institution_id === session.user.institution_id) ||
      (userRole === 'TEACHER' && course.teachers?.includes(session.user?.id)) ||
      (userRole === 'STUDENT' && course.students?.includes(session.user?.id))

    if (!canView) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este curso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Adicionar estatísticas
    const courseWithStats = {
      ...course,
      students_count: course.students?.length || 0,
      teachers_count: course.teachers?.length || 0
    }

    return NextResponse.json({
      success: true,
      data: courseWithStats
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar curso:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar curso
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateCourseSchema.safeParse(body)
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

    // Buscar curso existente
    const existingCourse = mockCourses.get(id)
    if (!existingCourse) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit =
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_MANAGER' && existingCourse.institution_id === session.user.institution_id)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar este curso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Se está alterando nome, verificar duplicação
    if (updateData.name && updateData.name !== existingCourse.name) {
      const duplicateCourse = Array.from(mockCourses.values()).find(
        course => course.name === updateData.name && 
                  course.institution_id === existingCourse.institution_id &&
                  course.id !== id
      )

      if (duplicateCourse) {
        return NextResponse.json({ error: 'Já existe um curso com este nome nesta instituição' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Atualizar curso
    const updatedCourse = {
      ...existingCourse,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockCourses.set(id, updatedCourse)

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Curso atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao atualizar curso:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover curso
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id

    // Buscar curso
    const existingCourse = mockCourses.get(id)
    if (!existingCourse) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete =
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_MANAGER' && existingCourse.institution_id === session.user.institution_id)

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar este curso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se curso tem alunos matriculados
    if (existingCourse.students && existingCourse.students.length > 0) {
      return NextResponse.json({ error: 'Não é possível deletar curso com alunos matriculados' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Deletar curso (em produção, seria soft delete)
    mockCourses.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Curso removido com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao deletar curso:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
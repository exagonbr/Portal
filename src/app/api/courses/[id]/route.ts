import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

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

    const courseId = params.id

    // Buscar curso
    const course = mockCourses.get(courseId)

    if (!course) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões de visualização
    const userRole = session.user?.role
    const canView = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && course.institution_id === session.user.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && course.institution_id === session.user.institution_id) ||
      (userRole === 'TEACHER' && course.teachers?.includes(session.user?.id)) ||
      (userRole === 'STUDENT' && course.students?.includes(session.user?.id))

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este curso' },
        { status: 403 }
      )
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
    })

  } catch (error) {
    console.error('Erro ao buscar curso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar curso
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

    const courseId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateCourseSchema.safeParse(body)
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

    // Buscar curso existente
    const existingCourse = mockCourses.get(courseId)
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingCourse.institution_id === session.user.institution_id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este curso' },
        { status: 403 }
      )
    }

    // Se está alterando nome, verificar duplicação
    if (updateData.name && updateData.name !== existingCourse.name) {
      const duplicateCourse = Array.from(mockCourses.values()).find(
        course => course.name === updateData.name && 
                  course.institution_id === existingCourse.institution_id &&
                  course.id !== courseId
      )

      if (duplicateCourse) {
        return NextResponse.json(
          { error: 'Já existe um curso com este nome nesta instituição' },
          { status: 409 }
        )
      }
    }

    // Atualizar curso
    const updatedCourse = {
      ...existingCourse,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockCourses.set(courseId, updatedCourse)

    return NextResponse.json({
      success: true,
      data: updatedCourse,
      message: 'Curso atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar curso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover curso
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

    const courseId = params.id

    // Buscar curso
    const existingCourse = mockCourses.get(courseId)
    if (!existingCourse) {
      return NextResponse.json(
        { error: 'Curso não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingCourse.institution_id === session.user.institution_id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este curso' },
        { status: 403 }
      )
    }

    // Verificar se curso tem alunos matriculados
    if (existingCourse.students && existingCourse.students.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar curso com alunos matriculados' },
        { status: 409 }
      )
    }

    // Deletar curso (em produção, seria soft delete)
    mockCourses.delete(courseId)

    return NextResponse.json({
      success: true,
      message: 'Curso removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar curso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
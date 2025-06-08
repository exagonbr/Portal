import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de turma
const updateClassSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  teacher_id: z.string().uuid('ID de professor inválido').nullable().optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_TIME']).optional(),
  max_students: z.number().int().positive().optional(),
  is_active: z.boolean().optional(),
  classroom: z.string().optional(),
  schedule: z.object({
    monday: z.array(z.string()).optional(),
    tuesday: z.array(z.string()).optional(),
    wednesday: z.array(z.string()).optional(),
    thursday: z.array(z.string()).optional(),
    friday: z.array(z.string()).optional(),
    saturday: z.array(z.string()).optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockClasses = new Map()

// GET - Buscar turma por ID
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

    const classId = params.id

    // Buscar turma
    const classData = mockClasses.get(classId)

    if (!classData) {
      return NextResponse.json(
        { error: 'Turma não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões de visualização
    const userRole = session.user.role
    const canView = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'SCHOOL_MANAGER' && classData.school_id === session.user.school_id) ||
      (userRole === 'TEACHER' && classData.teacher_id === session.user.id) ||
      (userRole === 'STUDENT' && classData.students?.includes(session.user.id)) ||
      (userRole === 'GUARDIAN' && classData.students?.some((studentId: string) => 
        session.user.dependents?.includes(studentId)
      ))

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta turma' },
        { status: 403 }
      )
    }

    // Adicionar estatísticas
    const classWithStats = {
      ...classData,
      students_count: classData.students?.length || 0,
      attendance_rate: classData.attendance_rate || 0,
      available_spots: classData.max_students - (classData.students?.length || 0)
    }

    return NextResponse.json({
      success: true,
      data: classWithStats
    })

  } catch (error) {
    console.error('Erro ao buscar turma:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar turma
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

    const classId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateClassSchema.safeParse(body)
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

    // Buscar turma existente
    const existingClass = mockClasses.get(classId)
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Turma não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'SCHOOL_MANAGER' && existingClass.school_id === session.user.school_id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta turma' },
        { status: 403 }
      )
    }

    // Validar número máximo de alunos
    if (updateData.max_students !== undefined) {
      const currentStudents = existingClass.students?.length || 0
      if (updateData.max_students < currentStudents) {
        return NextResponse.json(
          { error: `Número máximo de alunos não pode ser menor que o número atual (${currentStudents})` },
          { status: 400 }
        )
      }
    }

    // Atualizar turma
    const updatedClass = {
      ...existingClass,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    }

    mockClasses.set(classId, updatedClass)

    return NextResponse.json({
      success: true,
      data: updatedClass,
      message: 'Turma atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar turma:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover turma
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

    const classId = params.id

    // Buscar turma
    const existingClass = mockClasses.get(classId)
    if (!existingClass) {
      return NextResponse.json(
        { error: 'Turma não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'SCHOOL_MANAGER' && existingClass.school_id === session.user.school_id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta turma' },
        { status: 403 }
      )
    }

    // Verificar se turma tem alunos
    if (existingClass.students && existingClass.students.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar turma com alunos matriculados' },
        { status: 409 }
      )
    }

    // Verificar se turma está ativa
    if (existingClass.is_active) {
      return NextResponse.json(
        { error: 'Não é possível deletar turma ativa. Desative-a primeiro' },
        { status: 409 }
      )
    }

    // Deletar turma (em produção, seria soft delete)
    mockClasses.delete(classId)

    return NextResponse.json({
      success: true,
      message: 'Turma removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar turma:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
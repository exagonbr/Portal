import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de unidade
const updateUnitSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0').optional(),
  duration_hours: z.number().int().positive('Duração deve ser positiva').optional(),
  objectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_published: z.boolean().optional(),
  content: z.object({
    introduction: z.string().optional(),
    topics: z.array(z.object({
      title: z.string(),
      description: z.string(),
      order: z.number().int().positive()
    })).optional(),
    resources: z.array(z.object({
      type: z.enum(['VIDEO', 'PDF', 'LINK', 'DOCUMENT', 'PRESENTATION']),
      title: z.string(),
      url: z.string().url(),
      duration_minutes: z.number().int().positive().optional()
    })).optional()
  }).optional(),
  assessment: z.object({
    type: z.enum(['QUIZ', 'ASSIGNMENT', 'PROJECT', 'EXAM']),
    passing_score: z.number().min(0).max(100),
    max_attempts: z.number().int().positive().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockUnits = new Map()

// GET - Buscar unidade por ID
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

    const unitId = params.id

    // Buscar unidade
    const unit = mockUnits.get(unitId)

    if (!unit) {
      return NextResponse.json(
        { error: 'Unidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canViewDetails = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      userRole === 'TEACHER' ||
      (userRole === 'STUDENT' && unit.is_published && unit.is_active)

    if (!canViewDetails) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta unidade' },
        { status: 403 }
      )
    }

    // Adicionar informações de progresso para alunos
    let unitWithProgress = { ...unit }
    if (userRole === 'STUDENT') {
      // Buscar progresso do aluno
      unitWithProgress.user_progress = {
        completed: false,
        score: null,
        attempts: 0,
        last_accessed: new Date().toISOString()
      }
    }

    return NextResponse.json({
      success: true,
      data: unitWithProgress
    })

  } catch (error) {
    console.error('Erro ao buscar unidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar unidade
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

    const unitId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateUnitSchema.safeParse(body)
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

    // Buscar unidade existente
    const existingUnit = mockUnits.get(unitId)
    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingUnit.created_by === session.user.id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta unidade' },
        { status: 403 }
      )
    }

    // Se está alterando ordem, verificar duplicação
    if (updateData.order && updateData.order !== existingUnit.order) {
      const duplicateOrder = Array.from(mockUnits.values()).find(
        unit => unit.course_id === existingUnit.course_id && 
                unit.order === updateData.order &&
                unit.id !== unitId
      )

      if (duplicateOrder) {
        return NextResponse.json(
          { error: 'Já existe uma unidade com esta ordem neste curso' },
          { status: 409 }
        )
      }
    }

    // Atualizar unidade
    const updatedUnit = {
      ...existingUnit,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    }

    mockUnits.set(unitId, updatedUnit)

    return NextResponse.json({
      success: true,
      data: updatedUnit,
      message: 'Unidade atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar unidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover unidade
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

    const unitId = params.id

    // Buscar unidade
    const existingUnit = mockUnits.get(unitId)
    if (!existingUnit) {
      return NextResponse.json(
        { error: 'Unidade não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingUnit.created_by === session.user.id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta unidade' },
        { status: 403 }
      )
    }

    // Verificar se tem aulas vinculadas
    if (existingUnit.lessons && existingUnit.lessons.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar unidade com aulas vinculadas' },
        { status: 409 }
      )
    }

    // Verificar se está publicada
    if (existingUnit.is_published) {
      return NextResponse.json(
        { error: 'Não é possível deletar unidade publicada. Despublique-a primeiro' },
        { status: 409 }
      )
    }

    // Deletar unidade (em produção, seria soft delete)
    mockUnits.delete(unitId)

    // Reordenar outras unidades do curso
    const courseUnits = Array.from(mockUnits.values())
      .filter(unit => unit.course_id === existingUnit.course_id && unit.order > existingUnit.order)
    
    courseUnits.forEach(unit => {
      unit.order -= 1
      unit.updated_at = new Date().toISOString()
      mockUnits.set(unit.id, unit)
    })

    return NextResponse.json({
      success: true,
      message: 'Unidade removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar unidade:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de aula
const updateLessonSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  order: z.number().int().min(1, 'Ordem deve ser maior que 0').optional(),
  type: z.enum(['LIVE', 'RECORDED', 'HYBRID', 'SELF_PACED']).optional(),
  duration_minutes: z.number().int().positive('Duração deve ser positiva').optional(),
  scheduled_date: z.string().datetime().optional(),
  meeting_url: z.string().url().optional(),
  recording_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  is_published: z.boolean().optional(),
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
    required: z.boolean().optional(),
    min_duration_percent: z.number().min(0).max(100).optional()
  }).optional(),
  settings: z.object({
    allow_late_submission: z.boolean().optional(),
    enable_chat: z.boolean().optional(),
    enable_recording: z.boolean().optional(),
    max_participants: z.number().int().positive().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockLessons = new Map()

// GET - Buscar aula por ID
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

    const lessonId = params.id

    // Buscar aula
    const lesson = mockLessons.get(lessonId)

    if (!lesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canViewDetails = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      userRole === 'TEACHER' ||
      (userRole === 'STUDENT' && lesson.is_published && lesson.is_active)

    if (!canViewDetails) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta aula' },
        { status: 403 }
      )
    }

    // Adicionar informações de progresso para alunos
    let lessonWithProgress = { ...lesson }
    if (userRole === 'STUDENT') {
      lessonWithProgress.user_progress = {
        attended: false,
        completed: false,
        score: null,
        duration_watched: 0,
        last_accessed: new Date().toISOString()
      }
    }

    // Adicionar informações extras
    lessonWithProgress.is_upcoming = lesson.scheduled_date && new Date(lesson.scheduled_date) > new Date()
    lessonWithProgress.is_live_now = lesson.type === 'LIVE' && 
      lesson.scheduled_date && 
      new Date(lesson.scheduled_date) <= new Date() &&
      new Date(lesson.scheduled_date).getTime() + (lesson.duration_minutes * 60000) > new Date().getTime()

    return NextResponse.json({
      success: true,
      data: lessonWithProgress
    })

  } catch (error) {
    console.error('Erro ao buscar aula:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar aula
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

    const lessonId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateLessonSchema.safeParse(body)
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

    // Buscar aula existente
    const existingLesson = mockLessons.get(lessonId)
    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingLesson.created_by === session.user.id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta aula' },
        { status: 403 }
      )
    }

    // Se está alterando ordem, verificar duplicação
    if (updateData.order && updateData.order !== existingLesson.order) {
      const duplicateOrder = Array.from(mockLessons.values()).find(
        lesson => lesson.unit_id === existingLesson.unit_id && 
                  lesson.order === updateData.order &&
                  lesson.id !== lessonId
      )

      if (duplicateOrder) {
        return NextResponse.json(
          { error: 'Já existe uma aula com esta ordem nesta unidade' },
          { status: 409 }
        )
      }
    }

    // Validar mudança de tipo
    if (updateData.type && updateData.type !== existingLesson.type) {
      if (updateData.type === 'LIVE' && !existingLesson.scheduled_date && !updateData.scheduled_date) {
        return NextResponse.json(
          { error: 'Data agendada é obrigatória para aulas ao vivo' },
          { status: 400 }
        )
      }
    }

    // Não permitir alteração de aula em andamento
    if (existingLesson.type === 'LIVE' && existingLesson.is_live_now) {
      return NextResponse.json(
        { error: 'Não é possível editar aula em andamento' },
        { status: 409 }
      )
    }

    // Atualizar aula
    const updatedLesson = {
      ...existingLesson,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user.id
    }

    mockLessons.set(lessonId, updatedLesson)

    return NextResponse.json({
      success: true,
      data: updatedLesson,
      message: 'Aula atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar aula:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover aula
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

    const lessonId = params.id

    // Buscar aula
    const existingLesson = mockLessons.get(lessonId)
    if (!existingLesson) {
      return NextResponse.json(
        { error: 'Aula não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingLesson.created_by === session.user.id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta aula' },
        { status: 403 }
      )
    }

    // Não permitir deletar aula em andamento
    if (existingLesson.type === 'LIVE' && existingLesson.is_live_now) {
      return NextResponse.json(
        { error: 'Não é possível deletar aula em andamento' },
        { status: 409 }
      )
    }

    // Verificar se tem atividades ou avaliações vinculadas
    if (existingLesson.has_submissions || existingLesson.has_grades) {
      return NextResponse.json(
        { error: 'Não é possível deletar aula com atividades enviadas ou notas lançadas' },
        { status: 409 }
      )
    }

    // Deletar aula (em produção, seria soft delete)
    mockLessons.delete(lessonId)

    // Reordenar outras aulas da unidade
    const unitLessons = Array.from(mockLessons.values())
      .filter(lesson => lesson.unit_id === existingLesson.unit_id && lesson.order > existingLesson.order)
    
    unitLessons.forEach(lesson => {
      lesson.order -= 1
      lesson.updated_at = new Date().toISOString()
      mockLessons.set(lesson.id, lesson)
    })

    return NextResponse.json({
      success: true,
      message: 'Aula removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar aula:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
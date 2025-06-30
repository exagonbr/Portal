import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de quiz
const updateQuizSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').optional(),
  type: z.enum(['PRACTICE', 'GRADED', 'SURVEY', 'DIAGNOSTIC', 'COMPETITIVE']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADAPTIVE']).optional(),
  time_limit_minutes: z.number().int().positive().optional(),
  passing_score: z.number().min(0).max(100).optional(),
  max_attempts: z.number().int().positive().optional(),
  questions: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'ESSAY', 'MATCHING', 'ORDERING']),
    question: z.string(),
    description: z.string().optional(),
    points: z.number().positive(),
    time_limit_seconds: z.number().int().positive().optional(),
    media: z.object({
      type: z.enum(['IMAGE', 'VIDEO', 'AUDIO']),
      url: z.string().url()
    }).optional(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
      is_correct: z.boolean(),
      feedback: z.string().optional()
    })).optional(),
    correct_answers: z.array(z.string()).optional(),
    answer_explanation: z.string().optional(),
    hints: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional()
  })).min(1, 'Deve ter pelo menos uma questão').optional(),
  settings: z.object({
    shuffle_questions: z.boolean().optional(),
    shuffle_options: z.boolean().optional(),
    show_correct_answers: z.boolean().optional(),
    show_score_during: z.boolean().optional(),
    show_feedback: z.boolean().optional(),
    allow_review: z.boolean().optional(),
    require_sequential: z.boolean().optional(),
    prevent_copy: z.boolean().optional(),
    browser_lockdown: z.boolean().optional()
  }).optional(),
  availability: z.object({
    start_date: z.string().datetime().optional(),
    end_date: z.string().datetime().optional(),
    late_submission_allowed: z.boolean().optional(),
    late_penalty_percent: z.number().min(0).max(100).optional()
  }).optional(),
  is_published: z.boolean().optional()
})

// Mock database - substituir por Prisma/banco real
const mockQuizzes = new Map()
const mockQuizAttempts = new Map()

// GET - Buscar quiz por ID

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const quizId = params.id

    // Buscar quiz
    const quiz = mockQuizzes.get(quizId)

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const isCreator = quiz.created_by === session.user?.id
    const isAdmin = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)
    const isTeacher = userRole === 'TEACHER'
    const isStudent = userRole === 'STUDENT'

    // Estudantes só podem ver quizzes publicados
    if (isStudent && !quiz.is_published) {
      return NextResponse.json({ error: 'Quiz não disponível' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Buscar tentativas do usuário
    const userAttempts = mockQuizAttempts.get(`${quizId}_${session.user?.id}`) || []
    const bestAttempt = userAttempts.reduce((best: any, current: any) => 
      !best || current.score > best.score ? current : best, null
    )

    // Verificar disponibilidade
    const now = new Date()
    const startDate = quiz.availability?.start_date ? new Date(quiz.availability.start_date) : null
    const endDate = quiz.availability?.end_date ? new Date(quiz.availability.end_date) : null
    
    const isAvailable = (!startDate || startDate <= now) && (!endDate || endDate >= now)
    const isUpcoming = startDate && startDate > now
    const isExpired = endDate && endDate < now

    // Preparar resposta
    let quizData = {
      ...quiz,
      question_count: quiz.questions.length,
      total_points: quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0),
      attempts_used: userAttempts.length,
      attempts_remaining: quiz.max_attempts - userAttempts.length,
      best_score: bestAttempt?.score || null,
      last_attempt_at: userAttempts[userAttempts.length - 1]?.completed_at || null,
      status: isExpired ? 'expired' : isUpcoming ? 'upcoming' : isAvailable ? 'available' : 'unavailable',
      is_available: isAvailable,
      can_attempt: isAvailable && userAttempts.length < quiz.max_attempts,
      can_edit: isCreator || isAdmin,
      can_delete: isCreator || isAdmin,
      can_view_results: isCreator || isAdmin || isTeacher,
      time_remaining: endDate ? Math.max(0, endDate.getTime() - now.getTime()) : null
    }

    // Para estudantes, remover respostas corretas se não permitido
    if (isStudent && !quiz.settings?.show_correct_answers) {
      quizData.questions = quiz.questions.map((q: any) => {
        const question = { ...q }
        if (question.options) {
          question.options = question.options.map((opt: any) => ({
            id: opt.id,
            text: opt.text
            // Remover is_correct e feedback
          }))
        }
        delete question.correct_answers
        delete question.answer_explanation
        return question
      })
    }

    // Se o aluno já completou todas as tentativas, incluir revisão se permitido
    if (isStudent && userAttempts.length >= quiz.max_attempts && quiz.settings?.allow_review) {
      quizData.review_available = true
      quizData.attempts = userAttempts.map((attempt: any) => ({
        id: attempt.id,
        score: attempt.score,
        percentage: (attempt.score / quiz.total_points * 100).toFixed(1),
        completed_at: attempt.completed_at,
        duration_minutes: attempt.duration_minutes
      }))
    }

    return NextResponse.json({
      success: true,
      data: quizData
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar quiz:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const quizId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateQuizSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Buscar quiz existente
    const existingQuiz = mockQuizzes.get(quizId)
    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingQuiz.created_by === session.user?.id)

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar este quiz' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se já tem tentativas
    const allAttempts = Array.from(mockQuizAttempts.keys())
      .filter(key => key.startsWith(`${quizId}_`))
      .flatMap(key => mockQuizAttempts.get(key) || [])

    if (allAttempts.length > 0) {
      // Restringir alterações se já houver tentativas
      const restrictedFields = ['questions', 'passing_score', 'time_limit_minutes']
      const hasRestrictedChanges = restrictedFields.some(field => (updateData as any)[field] !== undefined)
      
      if (hasRestrictedChanges) {
        return NextResponse.json({ error: 'Não é possível alterar questões ou configurações estruturais após o quiz ter sido iniciado por alunos' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Validar datas se estiverem sendo alteradas
    if (updateData.availability) {
      const startDate = updateData.availability.start_date ? 
        new Date(updateData.availability.start_date) : 
        (existingQuiz.availability?.start_date ? new Date(existingQuiz.availability.start_date) : null)
      
      const endDate = updateData.availability.end_date ? 
        new Date(updateData.availability.end_date) : 
        (existingQuiz.availability?.end_date ? new Date(existingQuiz.availability.end_date) : null)
      
      if (startDate && endDate && endDate <= startDate) {
        return NextResponse.json({ error: 'Data de término deve ser posterior à data de início' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Recalcular pontos totais se questões foram alteradas
    let totalPoints = existingQuiz.total_points
    if (updateData.questions) {
      totalPoints = updateData.questions.reduce((sum: number, q: any) => sum + q.points, 0)
    }

    // Atualizar quiz
    const updatedQuiz = {
      ...existingQuiz,
      ...updateData,
      total_points: totalPoints,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockQuizzes.set(quizId, updatedQuiz)

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
      message: 'Quiz atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao atualizar quiz:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const quizId = params.id

    // Buscar quiz
    const existingQuiz = mockQuizzes.get(quizId)
    if (!existingQuiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_ADMIN' ||
      (userRole === 'TEACHER' && existingQuiz.created_by === session.user?.id)

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar este quiz' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se há tentativas
    const allAttempts = Array.from(mockQuizAttempts.keys())
      .filter(key => key.startsWith(`${quizId}_`))
      .flatMap(key => mockQuizAttempts.get(key) || [])

    if (allAttempts.length > 0) {
      return NextResponse.json({ error: 'Não é possível deletar quiz com tentativas registradas. Archive o quiz ao invés de deletar.' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Deletar quiz
    mockQuizzes.delete(quizId)

    return NextResponse.json({
      success: true,
      message: 'Quiz removido com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao deletar quiz:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de quiz
const createQuizSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  lesson_id: z.string().uuid('ID de aula inválido').optional(),
  class_id: z.string().uuid('ID de turma inválido').optional(),
  type: z.enum(['PRACTICE', 'GRADED', 'SURVEY', 'DIAGNOSTIC', 'COMPETITIVE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'ADAPTIVE']).default('MEDIUM'),
  time_limit_minutes: z.number().int().positive().optional(),
  passing_score: z.number().min(0).max(100).default(60),
  max_attempts: z.number().int().positive().default(1),
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
  })).min(1, 'Deve ter pelo menos uma questão'),
  settings: z.object({
    shuffle_questions: z.boolean().default(false),
    shuffle_options: z.boolean().default(false),
    show_correct_answers: z.boolean().default(true),
    show_score_during: z.boolean().default(false),
    show_feedback: z.boolean().default(true),
    allow_review: z.boolean().default(true),
    require_sequential: z.boolean().default(false),
    prevent_copy: z.boolean().default(false),
    browser_lockdown: z.boolean().default(false)
  }).optional(),
  availability: z.object({
    start_date: z.string().datetime(),
    end_date: z.string().datetime().optional(),
    late_submission_allowed: z.boolean().default(false),
    late_penalty_percent: z.number().min(0).max(100).optional()
  }).optional(),
  is_published: z.boolean().default(false)
})

// Mock database - substituir por Prisma/banco real
const mockQuizzes = new Map()
const mockQuizAttempts = new Map()

// GET - Listar quizzes

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
    const lesson_id = searchParams.get('lesson_id')
    const class_id = searchParams.get('class_id')
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const status = searchParams.get('status') // available, completed, upcoming
    const is_published = searchParams.get('is_published')

    // Buscar quizzes (substituir por query real)
    let quizzes = Array.from(mockQuizzes.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'STUDENT') {
      // Aluno vê apenas quizzes publicados das turmas matriculadas
      quizzes = quizzes.filter(quiz => 
        quiz.is_published && 
        // verificar se está matriculado na turma
        true
      )
    } else if (userRole === 'TEACHER') {
      // Professor vê quizzes das turmas que leciona
      // Implementar lógica de verificação
    }

    // Aplicar filtros
    if (search) {
      const searchLower = search.toLowerCase()
      quizzes = quizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(searchLower) ||
        quiz.description.toLowerCase().includes(searchLower)
      )
    }

    if (lesson_id) {
      quizzes = quizzes.filter(quiz => quiz.lesson_id === lesson_id)
    }

    if (class_id) {
      quizzes = quizzes.filter(quiz => quiz.class_id === class_id)
    }

    if (type) {
      quizzes = quizzes.filter(quiz => quiz.type === type)
    }

    if (difficulty) {
      quizzes = quizzes.filter(quiz => quiz.difficulty === difficulty)
    }

    if (is_published !== null) {
      quizzes = quizzes.filter(quiz => quiz.is_published === (is_published === 'true'))
    }

    // Adicionar informações de tentativas do usuário
    const quizzesWithInfo = quizzes.map(quiz => {
      const userAttempts = mockQuizAttempts.get(`${quiz.id}_${session.user?.id}`) || []
      const bestAttempt = userAttempts.reduce((best: any, current: any) => 
        !best || current.score > best.score ? current : best, null
      )
      
      const now = new Date()
      const startDate = quiz.availability?.start_date ? new Date(quiz.availability.start_date) : null
      const endDate = quiz.availability?.end_date ? new Date(quiz.availability.end_date) : null
      
      const isAvailable = (!startDate || startDate <= now) && (!endDate || endDate >= now)
      const isUpcoming = startDate && startDate > now
      const isExpired = endDate && endDate < now
      
      return {
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
        time_remaining: endDate ? Math.max(0, endDate.getTime() - now.getTime()) : null,
        estimated_duration: quiz.time_limit_minutes || Math.ceil(quiz.questions.length * 2) // 2 min por questão se não tiver limite
      }
    })

    // Filtrar por status se especificado
    let filteredQuizzes = quizzesWithInfo
    if (status) {
      filteredQuizzes = quizzesWithInfo.filter(quiz => {
        if (status === 'available') return quiz.is_available && quiz.can_attempt
        if (status === 'completed') return quiz.attempts_used > 0
        if (status === 'upcoming') return quiz.status === 'upcoming'
        return true
      })
    }

    // Ordenar por data de disponibilidade
    filteredQuizzes.sort((a, b) => {
      // Quizzes disponíveis primeiro
      if (a.is_available && !b.is_available) return -1
      if (!a.is_available && b.is_available) return 1
      
      // Depois por data de criação
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedQuizzes,
        pagination: {
          page,
          limit,
          total: filteredQuizzes.length,
          totalPages: Math.ceil(filteredQuizzes.length / limit, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar quizzes:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar quiz
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
    if (!userRole || !['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para criar quizzes' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createQuizSchema.safeParse(body)
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

    const quizData = validationResult.data

    // Validar datas de disponibilidade
    if (quizData.availability) {
      const startDate = new Date(quizData.availability.start_date)
      const endDate = quizData.availability.end_date ? new Date(quizData.availability.end_date) : null
      
      if (endDate && endDate <= startDate) {
        return NextResponse.json({ error: 'Data de término deve ser posterior à data de início' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Validar questões
    let totalPoints = 0
    quizData.questions.forEach((question, index) => {
      totalPoints += question.points
      
      // Validar opções para questões de múltipla escolha
      if (['MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(question.type)) {
        if (!question.options || question.options.length < 2) {
          throw new Error(`Questão ${index + 1} deve ter pelo menos 2 opções`)
        }
        
        const correctOptions = question.options.filter(opt => opt.is_correct)
        if (correctOptions.length === 0) {
          throw new Error(`Questão ${index + 1} deve ter pelo menos uma opção correta`)
        }
      }
      
      // Adicionar ID único para cada questão
      question.id = `q_${Date.now()}_${index}`
    })

    // Se for professor, verificar se tem permissão na turma
    if (userRole === 'TEACHER' && quizData.class_id) {
      // Implementar verificação se o professor leciona na turma
      // Por enquanto, permitir
    }

    // Criar quiz
    const newQuiz = {
      id: `quiz_${Date.now()}`,
      ...quizData,
      total_points: totalPoints,
      created_by: session.user?.id || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockQuizzes.set(newQuiz.id, newQuiz)

    return NextResponse.json({
      success: true,
      data: newQuiz,
      message: 'Quiz criado com sucesso'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro ao criar quiz:', error)
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
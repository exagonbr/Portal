import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'

// Schema de validação para criação de curso
const createCourseSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  institution_id: z.string().uuid('ID de instituição inválido'),
  level: z.enum(['FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'SUPERIOR', 'POS_GRADUACAO']),
  duration_months: z.number().int().positive('Duração deve ser positiva').optional(),
  is_active: z.boolean().default(true),
  code: z.string().optional(),
  workload_hours: z.number().int().positive().optional(),
  modality: z.enum(['PRESENCIAL', 'EAD', 'HIBRIDO']).optional()
})

// Mock database - substituir por Prisma/banco real
const mockCourses = new Map()

// GET - Listar cursos
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const institution_id = searchParams.get('institution_id')
    const level = searchParams.get('level')
    const is_active = searchParams.get('is_active')
    const modality = searchParams.get('modality')

    // Buscar cursos (substituir por query real)
    let courses = Array.from(mockCourses.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      courses = courses.filter(course => course.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && session.user.institution_id) {
      courses = courses.filter(course => course.institution_id === session.user.institution_id)
    } else if (userRole === 'TEACHER') {
      // Professor vê apenas cursos onde leciona
      courses = courses.filter(course => 
        course.teachers && course.teachers.includes(session.user?.id)
      )
    } else if (userRole === 'STUDENT') {
      // Aluno vê apenas cursos onde está matriculado
      courses = courses.filter(course => 
        course.students && course.students.includes(session.user?.id)
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      courses = courses.filter(course => 
        course.name.toLowerCase().includes(searchLower) ||
        (course.description && course.description.toLowerCase().includes(searchLower)) ||
        (course.code && course.code.toLowerCase().includes(searchLower))
      )
    }

    if (institution_id) {
      courses = courses.filter(course => course.institution_id === institution_id)
    }

    if (level) {
      courses = courses.filter(course => course.level === level)
    }

    if (is_active !== null) {
      courses = courses.filter(course => course.is_active === (is_active === 'true'))
    }

    if (modality) {
      courses = courses.filter(course => course.modality === modality)
    }

    // Ordenar por nome
    courses.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedCourses = courses.slice(startIndex, endIndex)

    // Adicionar contadores
    const coursesWithStats = paginatedCourses.map(course => ({
      ...course,
      students_count: course.students?.length || 0,
      teachers_count: course.teachers?.length || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: coursesWithStats,
        pagination: {
          page,
          limit,
          total: courses.length,
          totalPages: Math.ceil(courses.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar cursos:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar curso
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para criar cursos' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createCourseSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const courseData = validationResult.data

    // Se for INSTITUTION_ADMIN, forçar a instituição dele
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      courseData.institution_id = session.user.institution_id
    }

    // Verificar se já existe curso com mesmo nome na instituição
    const existingCourse = Array.from(mockCourses.values()).find(
      course => course.name === courseData.name && 
                course.institution_id === courseData.institution_id
    )

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Já existe um curso com este nome nesta instituição' },
        { status: 409 }
      )
    }

    // Criar curso
    const newCourse = {
      id: `course_${Date.now()}`,
      ...courseData,
      students: [],
      teachers: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockCourses.set(newCourse.id, newCourse)

    return NextResponse.json({
      success: true,
      data: newCourse,
      message: 'Curso criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar curso:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
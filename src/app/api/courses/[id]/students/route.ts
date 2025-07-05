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
// Schema de validação para matricular aluno
const enrollStudentSchema = z.object({
  student_id: z.string().uuid('ID de estudante inválido')
})

// Mock database - substituir por Prisma/banco real
const mockCourses = new Map()
const mockUsers = new Map()

// GET - Listar alunos do curso

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
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const courseId = resolvedParams.id

    // Buscar curso
    const course = mockCourses.get(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canViewStudents =
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_MANAGER' && course.institution_id === session.user.institution_id) ||
      (userRole === 'COORDINATOR' && course.institution_id === session.user.institution_id) ||
      (userRole === 'TEACHER' && course.teachers?.includes(session.user?.id))

    if (!canViewStudents) {
      return NextResponse.json({ error: 'Sem permissão para visualizar alunos deste curso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Parâmetros de paginação
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    // Buscar dados dos alunos
    const studentIds = course.students || []
    let students = studentIds.map((studentId: string) => {
      const user = mockUsers.get(studentId)
      return user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        enrollment_date: user.enrollment_date || new Date().toISOString()
      } : null
    }).filter(Boolean)

    // Aplicar busca
    if (search) {
      const searchLower = search.toLowerCase()
      students = students.filter((student: any) => 
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      )
    }

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedStudents = students.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        students: paginatedStudents,
        pagination: {
          page,
          limit,
          total: students.length,
          totalPages: Math.ceil(students.length / limit)
        }
      }
    })

  } catch (error) {
    console.log('Erro ao listar alunos do curso:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Matricular aluno no curso
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const courseId = resolvedParams.id
    const body = await request.json()

    // Validar dados
    const validationResult = enrollStudentSchema.safeParse(body)
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

    const { student_id } = validationResult.data

    // Buscar curso
    const course = mockCourses.get(courseId)
    if (!course) {
      return NextResponse.json({ error: 'Curso não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEnrollStudents =
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_MANAGER' && course.institution_id === session.user.institution_id) ||
      (userRole === 'COORDINATOR' && course.institution_id === session.user.institution_id)

    if (!canEnrollStudents) {
      return NextResponse.json({ error: 'Sem permissão para matricular alunos neste curso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se aluno existe
    const student = mockUsers.get(student_id)
    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se aluno já está matriculado
    if (course.students?.includes(student_id)) {
      return NextResponse.json({ error: 'Aluno já está matriculado neste curso' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Matricular aluno
    if (!course.students) {
      course.students = []
    }
    course.students.push(student_id)
    course.updated_at = new Date().toISOString()

    // Adicionar data de matrícula ao aluno
    if (!student.enrollments) {
      student.enrollments = {}
    }
    student.enrollments[courseId] = {
      enrolled_at: new Date().toISOString(),
      enrolled_by: session.user?.id
    }

    mockCourses.set(courseId, course)
    mockUsers.set(student_id, student)

    return NextResponse.json({
      success: true,
      message: 'Aluno matriculado com sucesso',
      data: {
        course_id: courseId,
        student_id: student_id,
        enrolled_at: student.enrollments[courseId].enrolled_at
      }
    }, { status: 201 })

  } catch (error) {
    console.log('Erro ao matricular aluno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Schema de validação para criação de turma
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
const createClassSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  course_id: z.string().uuid('ID de curso inválido'),
  school_id: z.string().uuid('ID de escola inválido'),
  teacher_id: z.string().uuid('ID de professor inválido').optional(),
  academic_year: z.number().int().min(2020).max(2030),
  semester: z.number().int().min(1).max(2).optional(),
  shift: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_TIME']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_students: z.number().int().positive().default(30),
  is_active: z.boolean().default(true),
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

// GET - Listar turmas

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
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
    const course_id = searchParams.get('course_id')
    const school_id = searchParams.get('school_id')
    const teacher_id = searchParams.get('teacher_id')
    const academic_year = searchParams.get('academic_year')
    const is_active = searchParams.get('is_active')
    const shift = searchParams.get('shift')

    // Buscar turmas (substituir por query real)
    let classes = Array.from(mockClasses.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'COORDINATOR' && session.user && 'school_id' in session.user && session.user.school_id) {
      const userSchoolId = (session.user as any).school_id;
      classes = classes.filter(cls => cls.school_id === userSchoolId)
    } else if (userRole === 'TEACHER') {
      // Professor vê apenas suas turmas
      classes = classes.filter(cls => cls.teacher_id === session.user?.id)
    } else if (userRole === 'STUDENT') {
      // Aluno vê apenas turmas onde está matriculado
      classes = classes.filter(cls => 
        cls.students && cls.students.includes(session.user?.id)
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      classes = classes.filter(cls => 
        cls.name.toLowerCase().includes(searchLower) ||
        (cls.classroom && cls.classroom.toLowerCase().includes(searchLower))
      )
    }

    if (course_id) {
      classes = classes.filter(cls => cls.course_id === course_id)
    }

    if (school_id) {
      classes = classes.filter(cls => cls.school_id === school_id)
    }

    if (teacher_id) {
      classes = classes.filter(cls => cls.teacher_id === teacher_id)
    }

    if (academic_year) {
      classes = classes.filter(cls => cls.academic_year === parseInt(academic_year))
    }

    if (is_active !== null) {
      classes = classes.filter(cls => cls.is_active === (is_active === 'true'))
    }

    if (shift) {
      classes = classes.filter(cls => cls.shift === shift)
    }

    // Ordenar por nome
    classes.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedClasses = classes.slice(startIndex, endIndex)

    // Adicionar contadores
    const classesWithStats = paginatedClasses.map(cls => ({
      ...cls,
      students_count: cls.students?.length || 0,
      attendance_rate: cls.attendance_rate || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: classesWithStats,
        pagination: {
          page,
          limit,
          total: classes.length,
          totalPages: Math.ceil(classes.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar turmas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar turma
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR'])) {
      return NextResponse.json({ error: 'Sem permissão para criar turmas' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createClassSchema.safeParse(body)
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

    const classData = validationResult.data

    // Se for COORDINATOR, forçar a escola dele
    if (userRole === 'COORDINATOR' && session.user && 'school_id' in session.user && session.user.school_id) {
      const userSchoolId = (session.user as any).school_id;
      classData.school_id = userSchoolId;
    }

    // Validar datas
    const startDate = new Date(classData.start_date)
    const endDate = new Date(classData.end_date)
    
    if (startDate >= endDate) {
      return NextResponse.json({ error: 'Data de início deve ser anterior à data de término' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se já existe turma com mesmo nome no mesmo período
    const existingClass = Array.from(mockClasses.values()).find(
      cls => cls.name === classData.name && 
             cls.school_id === classData.school_id &&
             cls.academic_year === classData.academic_year &&
             cls.semester === classData.semester
    )

    if (existingClass) {
      return NextResponse.json({ error: 'Já existe uma turma com este nome neste período' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Criar turma
    const newClass = {
      id: `class_${Date.now()}`,
      ...classData,
      students: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockClasses.set(newClass.id, newClass)

    return NextResponse.json({
      success: true,
      data: newClass,
      message: 'Turma criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar turma:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 

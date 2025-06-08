import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de escola
const createSchoolSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  institution_id: z.string().uuid('ID de instituição inválido'),
  code: z.string().min(2, 'Código deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.object({
    street: z.string().min(3),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos')
  }),
  principal_name: z.string().min(3, 'Nome do diretor é obrigatório'),
  principal_email: z.string().email('Email do diretor inválido'),
  type: z.enum(['PUBLIC', 'PRIVATE', 'CHARTER']),
  education_levels: z.array(z.enum(['INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'TECNICO', 'EJA'])),
  shifts: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_TIME'])),
  is_active: z.boolean().default(true),
  settings: z.object({
    maxStudentsPerClass: z.number().int().positive().default(30),
    allowOnlineClasses: z.boolean().default(false),
    hasLibrary: z.boolean().default(true),
    hasLab: z.boolean().default(false),
    hasSportsArea: z.boolean().default(true)
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockSchools = new Map()

// GET - Listar escolas
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
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
    const type = searchParams.get('type')
    const education_level = searchParams.get('education_level')
    const shift = searchParams.get('shift')
    const is_active = searchParams.get('is_active')

    // Buscar escolas (substituir por query real)
    let schools = Array.from(mockSchools.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      schools = schools.filter(school => school.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && session.user.school_id) {
      schools = schools.filter(school => school.id === session.user.school_id)
    } else if (!['SYSTEM_ADMIN'].includes(userRole)) {
      // Outros usuários veem apenas escolas ativas da sua instituição
      schools = schools.filter(school => 
        school.is_active && 
        school.institution_id === session.user.institution_id
      )
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      schools = schools.filter(school => 
        school.name.toLowerCase().includes(searchLower) ||
        school.code.toLowerCase().includes(searchLower) ||
        school.email.toLowerCase().includes(searchLower)
      )
    }

    if (institution_id) {
      schools = schools.filter(school => school.institution_id === institution_id)
    }

    if (type) {
      schools = schools.filter(school => school.type === type)
    }

    if (education_level) {
      schools = schools.filter(school => 
        school.education_levels.includes(education_level)
      )
    }

    if (shift) {
      schools = schools.filter(school => 
        school.shifts.includes(shift)
      )
    }

    if (is_active !== null) {
      schools = schools.filter(school => school.is_active === (is_active === 'true'))
    }

    // Ordenar por nome
    schools.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedSchools = schools.slice(startIndex, endIndex)

    // Adicionar estatísticas
    const schoolsWithStats = paginatedSchools.map(school => ({
      ...school,
      students_count: school.students_count || 0,
      teachers_count: school.teachers_count || 0,
      classes_count: school.classes_count || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: schoolsWithStats,
        pagination: {
          page,
          limit,
          total: schools.length,
          totalPages: Math.ceil(schools.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar escolas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar escola
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar escolas' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createSchoolSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const schoolData = validationResult.data

    // Se for INSTITUTION_ADMIN, forçar a instituição dele
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      schoolData.institution_id = session.user.institution_id
    }

    // Verificar se código já existe na instituição
    const existingCode = Array.from(mockSchools.values()).find(
      school => school.code === schoolData.code && 
                school.institution_id === schoolData.institution_id
    )

    if (existingCode) {
      return NextResponse.json(
        { error: 'Já existe uma escola com este código nesta instituição' },
        { status: 409 }
      )
    }

    // Verificar se email já existe
    const existingEmail = Array.from(mockSchools.values()).find(
      school => school.email === schoolData.email
    )

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já cadastrado para outra escola' },
        { status: 409 }
      )
    }

    // Criar escola
    const newSchool = {
      id: `school_${Date.now()}`,
      ...schoolData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockSchools.set(newSchool.id, newSchool)

    return NextResponse.json({
      success: true,
      data: newSchool,
      message: 'Escola criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar escola:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
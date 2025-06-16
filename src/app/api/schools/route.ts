import { NextRequest, NextResponse } from 'next/server'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
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
const mockSchools = new Map([
  ['school_1', {
    id: 'school_1',
    name: 'Escola Estadual Dom Pedro II',
    code: 'EEDP2',
    institution_id: 'inst_sabercon',
    type: 'PUBLIC',
    description: 'Escola pública de ensino fundamental e médio',
    address: {
      street: 'Rua das Flores',
      number: '123',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567'
    },
    phone: '(11) 3456-7890',
    email: 'contato@eedp2.edu.br',
    principal_name: 'Maria Silva',
    principal_email: 'diretora@eedp2.edu.br',
    education_levels: ['FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO'],
    shifts: ['MORNING', 'AFTERNOON'],
    is_active: true,
    students_count: 450,
    teachers_count: 32,
    classes_count: 18,
    settings: {
      maxStudentsPerClass: 30,
      allowOnlineClasses: true,
      hasLibrary: true,
      hasLab: true,
      hasSportsArea: true
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }],
  ['school_2', {
    id: 'school_2',
    name: 'Colégio Particular Santa Clara',
    code: 'CPSC',
    institution_id: 'inst_sabercon',
    type: 'PRIVATE',
    description: 'Colégio particular de ensino integral',
    address: {
      street: 'Av. Paulista',
      number: '1000',
      complement: 'Torre A',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100'
    },
    phone: '(11) 9876-5432',
    email: 'secretaria@santaclara.edu.br',
    principal_name: 'João Santos',
    principal_email: 'diretor@santaclara.edu.br',
    education_levels: ['INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO'],
    shifts: ['FULL_TIME'],
    is_active: true,
    students_count: 280,
    teachers_count: 25,
    classes_count: 12,
    settings: {
      maxStudentsPerClass: 25,
      allowOnlineClasses: true,
      hasLibrary: true,
      hasLab: true,
      hasSportsArea: true
    },
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }],
  ['school_3', {
    id: 'school_3',
    name: 'Centro de Educação Técnica',
    code: 'CET',
    institution_id: 'inst_ifsp',
    type: 'PUBLIC',
    description: 'Centro de educação técnica e profissionalizante',
    address: {
      street: 'Rua Tecnológica',
      number: '500',
      complement: '',
      neighborhood: 'Vila Industrial',
      city: 'Campinas',
      state: 'SP',
      zipCode: '13040123'
    },
    phone: '(19) 3234-5678',
    email: 'contato@cet.edu.br',
    principal_name: 'Ana Costa',
    principal_email: 'diretora@cet.edu.br',
    education_levels: ['MEDIO', 'TECNICO'],
    shifts: ['MORNING', 'AFTERNOON', 'EVENING'],
    is_active: true,
    students_count: 600,
    teachers_count: 45,
    classes_count: 24,
    settings: {
      maxStudentsPerClass: 35,
      allowOnlineClasses: false,
      hasLibrary: true,
      hasLab: true,
      hasSportsArea: false
    },
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }]
])

// GET - Listar escolas
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
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
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar escola
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'])) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createSchoolSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Dados inválidos',
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
        { success: false, message: 'Já existe uma escola com este código nesta instituição' },
        { status: 409 }
      )
    }

    // Verificar se email já existe
    const existingEmail = Array.from(mockSchools.values()).find(
      school => school.email === schoolData.email
    )

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email já cadastrado para outra escola' },
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
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
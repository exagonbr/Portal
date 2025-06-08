import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de instituição
const createInstitutionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos'),
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
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  type: z.enum(['PRIVATE', 'PUBLIC', 'MIXED']),
  is_active: z.boolean().default(true),
  settings: z.object({
    allowStudentRegistration: z.boolean().default(false),
    requireEmailVerification: z.boolean().default(true),
    maxSchools: z.number().int().positive().default(10),
    maxUsersPerSchool: z.number().int().positive().default(1000)
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockInstitutions = new Map()

// GET - Listar instituições
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
    const is_active = searchParams.get('is_active')
    const type = searchParams.get('type')

    // Buscar instituições (substituir por query real)
    let institutions = Array.from(mockInstitutions.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user.role
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      // Admin de instituição vê apenas sua própria instituição
      institutions = institutions.filter(inst => inst.id === session.user.institution_id)
    } else if (!['SYSTEM_ADMIN'].includes(userRole)) {
      // Outros usuários veem apenas instituições ativas
      institutions = institutions.filter(inst => inst.is_active)
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      institutions = institutions.filter(inst => 
        inst.name.toLowerCase().includes(searchLower) ||
        inst.cnpj.includes(search) ||
        inst.email.toLowerCase().includes(searchLower)
      )
    }

    if (is_active !== null) {
      institutions = institutions.filter(inst => inst.is_active === (is_active === 'true'))
    }

    if (type) {
      institutions = institutions.filter(inst => inst.type === type)
    }

    // Ordenar por nome
    institutions.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedInstitutions = institutions.slice(startIndex, endIndex)

    // Adicionar estatísticas
    const institutionsWithStats = paginatedInstitutions.map(inst => ({
      ...inst,
      schools_count: inst.schools?.length || 0,
      users_count: inst.users_count || 0,
      courses_count: inst.courses_count || 0
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: institutionsWithStats,
        pagination: {
          page,
          limit,
          total: institutions.length,
          totalPages: Math.ceil(institutions.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar instituições:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar instituição
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN pode criar instituições
    if (session.user.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para criar instituições' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createInstitutionSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const institutionData = validationResult.data

    // Verificar se CNPJ já existe
    const existingCNPJ = Array.from(mockInstitutions.values()).find(
      inst => inst.cnpj === institutionData.cnpj
    )

    if (existingCNPJ) {
      return NextResponse.json(
        { error: 'CNPJ já cadastrado' },
        { status: 409 }
      )
    }

    // Verificar se email já existe
    const existingEmail = Array.from(mockInstitutions.values()).find(
      inst => inst.email === institutionData.email
    )

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email já cadastrado para outra instituição' },
        { status: 409 }
      )
    }

    // Criar instituição
    const newInstitution = {
      id: `inst_${Date.now()}`,
      ...institutionData,
      schools: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user.id
    }

    mockInstitutions.set(newInstitution.id, newInstitution)

    return NextResponse.json({
      success: true,
      data: newInstitution,
      message: 'Instituição criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar instituição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
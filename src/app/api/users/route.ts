import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role_id: z.string().uuid('ID de role inválido'),
  institution_id: z.string().uuid('ID de instituição inválido').optional(),
  school_id: z.string().uuid('ID de escola inválido').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
})

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Listar usuários
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões baseadas no role
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para listar usuários' },
        { status: 403 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role_id = searchParams.get('role_id')
    const institution_id = searchParams.get('institution_id')
    const school_id = searchParams.get('school_id')
    const is_active = searchParams.get('is_active')

    // Simular busca no banco (substituir por query real)
    let users = Array.from(mockUsers.values())

    // Aplicar filtros
    if (search) {
      users = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (role_id) {
      users = users.filter(user => user.role_id === role_id)
    }

    if (institution_id) {
      users = users.filter(user => user.institution_id === institution_id)
    }

    if (school_id) {
      users = users.filter(user => user.school_id === school_id)
    }

    if (is_active !== null) {
      users = users.filter(user => user.is_active === (is_active === 'true'))
    }

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    // Remover senhas dos resultados
    const sanitizedUsers = paginatedUsers.map(({ password, ...user }) => user)

    return NextResponse.json({
      success: true,
      data: sanitizedUsers,
      pagination: {
        page,
        limit,
        total: users.length,
        totalPages: Math.ceil(users.length / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar usuário
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
    if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para criar usuários' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const userData = validationResult.data

    // Verificar se email já existe
    const existingUser = Array.from(mockUsers.values()).find(
      user => user.email === userData.email
    )

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Criar usuário (substituir por inserção no banco real)
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Hash da senha seria feito aqui
    // newUser.password = await bcrypt.hash(userData.password, 10)

    mockUsers.set(newUser.id, newUser)

    // Remover senha da resposta
    const { password, ...userResponse } = newUser

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'Usuário criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
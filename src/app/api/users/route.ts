import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from './lib/auth-utils'

// Schema de validação para criação de usuário
const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  role: z.enum(['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN']),
  institution_id: z.string().uuid().optional(),
  school_id: z.string().uuid().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional()
})

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Listar usuários
export async function GET(request: NextRequest) {
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
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'])) {
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
    const role = searchParams.get('role')
    const institution_id = searchParams.get('institution_id')
    const is_active = searchParams.get('is_active')

    // Buscar usuários (substituir por query real)
    let users = Array.from(mockUsers.values())

    // Aplicar filtros baseados no role do usuário
    if (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id) {
      users = users.filter(user => user.institution_id === session.user.institution_id)
    } else if (userRole === 'SCHOOL_MANAGER' && session.user.school_id) {
      users = users.filter(user => user.school_id === session.user.school_id)
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }

    if (role) {
      users = users.filter(user => user.role === role)
    }

    if (institution_id) {
      users = users.filter(user => user.institution_id === institution_id)
    }

    if (is_active !== null) {
      users = users.filter(user => user.is_active === (is_active === 'true'))
    }

    // Ordenar por nome
    users.sort((a, b) => a.name.localeCompare(b.name))

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedUsers = users.slice(startIndex, endIndex)

    // Remover dados sensíveis
    const safeUsers = paginatedUsers.map(user => ({
      ...user,
      password: undefined
    }))

    return NextResponse.json({
      success: true,
      data: {
        items: safeUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          totalPages: Math.ceil(users.length / limit)
        }
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
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!hasRequiredRole(userRole, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'])) {
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
        { error: 'Email já está em uso' },
        { status: 409 }
      )
    }

    // Criar usuário
    const newUser = {
      id: `user_${Date.now()}`,
      ...userData,
      password: userData.password || 'password123', // Gerar senha temporária
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
    }

    mockUsers.set(newUser.id, newUser)

    // Remover senha da resposta
    const { password, ...safeUser } = newUser

    return NextResponse.json({
      success: true,
      data: safeUser,
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
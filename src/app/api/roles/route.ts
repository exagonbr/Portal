import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { mockRoles, findRoleByName } from './mockDatabase'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().default(true)
})

// GET - Listar roles
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
    const active = searchParams.get('active')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Buscar roles
    let roles = Array.from(mockRoles.values())

    // Aplicar filtros baseados no role do usuário
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(userRole)) {
      // Usuários comuns veem apenas roles ativas
      roles = roles.filter(role => role.active)
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      roles = roles.filter(role => 
        role.name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      )
    }

    if (active !== null) {
      roles = roles.filter(role => role.active === (active === 'true'))
    }

    // Ordenar
    roles.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      }
      if (sortBy === 'users_count') {
        const countA = a.users_count || 0
        const countB = b.users_count || 0
        return sortOrder === 'asc' ? countA - countB : countB - countA
      }
      // Default para created_at
      return sortOrder === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedRoles = roles.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedRoles,
        pagination: {
          page,
          limit,
          total: roles.length,
          totalPages: Math.ceil(roles.length / limit),
          hasNext: endIndex < roles.length,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar roles:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN e INSTITUTION_MANAGER podem criar roles
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(session.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para criar roles' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const roleData = validationResult.data

    // Verificar se nome já existe
    const existingRole = findRoleByName(roleData.name)

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma role com este nome' },
        { status: 409 }
      )
    }

    // Criar role
    const newRole = {
      id: `role_${Date.now()}`,
      ...roleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users_count: 0
    }

    mockRoles.set(newRole.id, newRole)

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Role criada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar role:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar role (redireciona para o endpoint correto)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'Método não permitido neste endpoint',
      message: 'Para atualizar uma role, use PUT /api/roles/{id}',
      example: 'PUT /api/roles/role_123456'
    },
    { status: 405 }
  )
}
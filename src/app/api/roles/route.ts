import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { mockRoles, findRoleByName } from './mockDatabase'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
})

// GET - Listar roles
export async function GET(request: NextRequest) {
  try {
    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const is_active = searchParams.get('is_active')
    const public_access = searchParams.get('public') === 'true'

    // Se for acesso público (para combos), não verificar autenticação
    if (!public_access) {
      const session = await getAuthentication(request)
      
      if (!session) {
        return NextResponse.json(
          { error: 'Não autorizado' },
          { status: 401 }
        )
      }

      // Verificar permissões
      if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'])) {
        return NextResponse.json(
          { error: 'Sem permissão para listar roles' },
          { status: 403 }
        )
      }
    }

    // Buscar roles
    let roles = Array.from(mockRoles.values())

    // Para acesso público, retornar apenas roles ativas básicas
    if (public_access) {
      roles = roles.filter(role => role.active && role.status === 'active')
      // Retornar apenas campos essenciais para o combo
      const publicRoles = roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        status: role.status,
        created_at: role.created_at,
        updated_at: role.updated_at
      }))

      console.log('🔓 Retornando roles públicas:', publicRoles.length, 'roles encontradas');
      console.log('📋 Roles disponíveis:', publicRoles.map(r => ({ id: r.id, name: r.name })));

      return NextResponse.json({
        success: true,
        data: publicRoles
      })
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      roles = roles.filter(role => 
        role.name.toLowerCase().includes(searchLower) ||
        (role.description && role.description.toLowerCase().includes(searchLower))
      )
    }

    if (is_active !== null) {
      roles = roles.filter(role => role.active === (is_active === 'true'))
    }

    // Ordenar por nome
    roles.sort((a, b) => a.name.localeCompare(b.name))

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
          totalPages: Math.ceil(roles.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar roles:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar role
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
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para criar roles' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = createRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const roleData = validationResult.data

    // Verificar se já existe role com mesmo nome
    const existingRole = findRoleByName(roleData.name)
    if (existingRole) {
      return NextResponse.json(
        { error: 'Já existe uma role com este nome' },
        { status: 409 }
      )
    }

    // Criar role
    const newRole = {
      id: `role_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      status: 'active',
      active: roleData.is_active,
      users_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: session.user?.id
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
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar role (redireciona para o endpoint correto)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Verificar permissões
    if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar roles' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID da role é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar role existente
    const existingRole = mockRoles.get(id)
    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    // Atualizar role
    const updatedRole = {
      ...existingRole,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }
    
    mockRoles.set(id, updatedRole)

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar role:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
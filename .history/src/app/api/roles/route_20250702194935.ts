import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '@/lib/auth-utils'
import { mockRoles, findRoleByName } from './mockDatabase'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Schema de validação para criação de role
const createRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
})

// GET - Listar roles

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

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
        return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }

      // Verificar permissões
      if (!hasRequiredRole(session.user?.role, ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'])) {
        return NextResponse.json({ error: 'Sem permissão para listar roles' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
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
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
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
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao listar roles:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Criar role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch((e) => ({ error: 'Invalid JSON body', details: e.message }));
    
    console.log("Request body received in /api/roles:", body);

    // Apenas para depuração, retorna o corpo recebido.
    return NextResponse.json({
      message: "Debug response for POST /roles",
      received_body: body
    }, { status: 200 });

  } catch (error) {
    console.error('Erro fatal ao processar POST em /api/roles:', error)
    const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: `Fatal error in POST /roles: ${errorMessage}`
    }, {
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar role (redireciona para o endpoint correto)
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    if (!session.user?.role || !hasRequiredRole(session.user.role, ['SYSTEM_ADMIN'])) {
      return NextResponse.json({ error: 'Sem permissão para atualizar roles' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'ID da role é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Buscar role existente
    const existingRole = mockRoles.get(id)
    if (!existingRole) {
      return NextResponse.json({ error: 'Role não encontrada' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
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
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('Erro ao atualizar role:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

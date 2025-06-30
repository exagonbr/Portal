import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { mockRoles, findRoleById, findRoleByName } from '../mockDatabase'

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

// Schema de validação para atualização de role
const updateRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  active: z.boolean().optional()
})

// GET - Obter role por ID

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const role = findRoleById(roleId)

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: role
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`Erro ao buscar role ${resolvedParams.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN e INSTITUTION_MANAGER podem atualizar roles
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(session.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para atualizar roles' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const existingRole = findRoleById(roleId)

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = updateRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
          success: false,
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const roleData = validationResult.data

    // Verificar se o novo nome já existe (se estiver sendo atualizado)
    if (roleData.name && roleData.name !== existingRole.name) {
      const roleWithSameName = findRoleByName(roleData.name)
      if (roleWithSameName && roleWithSameName.id !== roleId) {
        return NextResponse.json(
          { success: false, error: 'Já existe uma role com este nome' },
          { status: 409 }
        )
      }
    }

    // Atualizar role
    const updatedRole = {
      ...existingRole,
      ...roleData,
      updated_at: new Date().toISOString()
    }

    mockRoles.set(roleId, updatedRole)

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`Erro ao atualizar role ${resolvedParams.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN pode deletar roles
    if (session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para deletar roles' },
        { status: 403 }
      )
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const existingRole = findRoleById(roleId)

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a role está em uso (simulado)
    if (existingRole.users_count && existingRole.users_count > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar role que está em uso' },
        { status: 409 }
      )
    }

    // Deletar role
    mockRoles.delete(roleId)

    return NextResponse.json({
      success: true,
      message: 'Role deletada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`Erro ao deletar role ${resolvedParams.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
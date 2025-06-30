import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PERMISSION_GROUPS } from '@/types/roleManagement'
import { findRoleById } from '../../mockDatabase'

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

// GET - Obter permissões de uma role

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
    const resolvedParams = await params
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const roleId = resolvedParams.id
    const role = findRoleById(roleId)

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    // Retorna as permissões da role organizadas por grupos
    const permissionsByGroup = PERMISSION_GROUPS.map(group => ({
      ...group,
      permissions: group.permissions.map(permission => ({
        ...permission,
        enabled: role.permissions?.includes(permission.key) || false
      }))
    }))

    return NextResponse.json({
      success: true,
      data: {
        roleId: role.id,
        roleName: role.name,
        permissionGroups: permissionsByGroup,
        totalPermissions: PERMISSION_GROUPS.reduce((total, group) => total + group.permissions.length, 0),
        enabledPermissions: role.permissions?.length || 0
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error(`Erro ao buscar permissões da role ${resolvedParams.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
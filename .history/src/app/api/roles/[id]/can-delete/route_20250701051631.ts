import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { mockRoles, findRoleById } from '../../mockDatabase'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'


// GET - Verificar se role pode ser deletada

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

    // Apenas SYSTEM_ADMIN pode verificar se role pode ser deletada
    if (session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para esta operação' },
        { status: 403 }
      )
    }

    const roleId = resolvedParams.id
    const existingRole = findRoleById(roleId)

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se a role está em uso (simulado)
    const usersCount = existingRole.users_count || 0
    const canDelete = usersCount === 0
    const reason = canDelete ? undefined : 'Esta role está associada a usuários ativos'

    return NextResponse.json({
      success: true,
      data: {
        canDelete,
        reason,
        usersCount
      }
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log(`Erro ao verificar se role ${resolvedParams.id} pode ser deletada:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
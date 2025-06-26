import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PERMISSION_GROUPS } from '@/types/roleManagement'
import { findRoleById } from '../../mockDatabase'

// GET - Obter permissões de uma role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const roleId = params.id
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
    })

  } catch (error) {
    console.error(`Erro ao buscar permissões da role ${params.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { mockRoles, findRoleById } from '../../mockDatabase'

// Schema de validação para alteração de status
const toggleStatusSchema = z.object({
  active: z.boolean()
})

// PATCH - Alterar status da role (ativar/desativar)
export async function PATCH(
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

    // Apenas SYSTEM_ADMIN e INSTITUTION_MANAGER podem alterar status
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(session.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para alterar status de roles' },
        { status: 403 }
      )
    }

    const roleId = params.id
    const existingRole = findRoleById(roleId)

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = toggleStatusSchema.safeParse(body)
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

    const { active } = validationResult.data

    // Atualizar status da role
    const updatedRole = {
      ...existingRole,
      active,
      updated_at: new Date().toISOString()
    }

    mockRoles.set(roleId, updatedRole)

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: `Role ${active ? 'ativada' : 'desativada'} com sucesso`
    })

  } catch (error) {
    console.error(`Erro ao alterar status da role ${params.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
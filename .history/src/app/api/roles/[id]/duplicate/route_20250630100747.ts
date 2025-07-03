import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { mockRoles, findRoleById, findRoleByName } from '../../mockDatabase'

// Schema de validação para duplicação de role
const duplicateRoleSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres')
})

// POST - Duplicar role

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(
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

    // Apenas SYSTEM_ADMIN e INSTITUTION_MANAGER podem duplicar roles
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(session.user?.role)) {
      return NextResponse.json(
        { success: false, error: 'Sem permissão para duplicar roles' },
        { status: 403 }
      )
    }

    const roleId = params.id
    const existingRole = findRoleById(roleId)

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role original não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = duplicateRoleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({ 
          success: false,
          error: 'Dados inválidos',
          errors: validationResult.error.flatten(, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }).fieldErrors
        },
        { status: 400 }
      )
    }

    const { name } = validationResult.data

    // Verificar se o nome já existe
    const roleWithSameName = findRoleByName(name)
    if (roleWithSameName) {
      return NextResponse.json(
        { success: false, error: 'Já existe uma role com este nome' },
        { status: 409 }
      )
    }

    // Criar nova role baseada na original
    const newRole = {
      id: `role_${Date.now()}`,
      name,
      description: existingRole.description ? `${existingRole.description} (Cópia)` : `Cópia de ${existingRole.name}`,
      permissions: existingRole.permissions ? [...existingRole.permissions] : [],
      status: existingRole.status || 'active',
      active: true,
      users_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockRoles.set(newRole.id, newRole)

    return NextResponse.json({
      success: true,
      data: newRole,
      message: 'Role duplicada com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error(`Erro ao duplicar role ${params.id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
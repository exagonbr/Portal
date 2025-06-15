import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthentication, hasRequiredRole } from '../lib/auth-utils'

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  role: z.enum(['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'TEACHER', 'STUDENT', 'GUARDIAN']).optional(),
  is_active: z.boolean().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional()
})

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id

    // Buscar usuário
    const user = mockUsers.get(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões de visualização
    const userRole = session.user?.role
    const canView = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && user.institution_id === session.user.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && user.school_id === session.user.school_id) ||
      session.user?.id === userId // Próprio usuário

    if (!canView) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este usuário' },
        { status: 403 }
      )
    }

    // Remover dados sensíveis
    const { password, ...safeUser } = user

    return NextResponse.json({
      success: true,
      data: safeUser
    })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateUserSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    // Buscar usuário existente
    const existingUser = mockUsers.get(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingUser.institution_id === session.user.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && existingUser.school_id === session.user.school_id) ||
      (session.user?.id === userId && !updateData.role) // Próprio usuário (sem alterar role)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este usuário' },
        { status: 403 }
      )
    }

    // Se está alterando email, verificar duplicação
    if (updateData.email && updateData.email !== existingUser.email) {
      const duplicateUser = Array.from(mockUsers.values()).find(
        user => user.email === updateData.email && user.id !== userId
      )

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Email já está em uso' },
          { status: 409 }
        )
      }
    }

    // Atualizar usuário
    const updatedUser = {
      ...existingUser,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockUsers.set(userId, updatedUser)

    // Remover dados sensíveis
    const { password, ...safeUser } = updatedUser

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'Usuário atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthentication(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id

    // Buscar usuário
    const existingUser = mockUsers.get(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingUser.institution_id === session.user.institution_id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar este usuário' },
        { status: 403 }
      )
    }

    // Não permitir deletar próprio usuário
    if (session.user?.id === userId) {
      return NextResponse.json(
        { error: 'Não é possível deletar seu próprio usuário' },
        { status: 409 }
      )
    }

    // Deletar usuário (em produção, seria soft delete)
    mockUsers.delete(userId)

    return NextResponse.json({
      success: true,
      message: 'Usuário removido com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de usuário
const updateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  role_id: z.string().uuid('ID de role inválido').optional(),
  institution_id: z.string().uuid('ID de instituição inválido').nullable().optional(),
  school_id: z.string().uuid('ID de escola inválido').nullable().optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  is_active: z.boolean().optional()
})

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Buscar usuário por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const userId = params.id

    // Buscar usuário (substituir por query real)
    const user = mockUsers.get(userId)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const isSelf = session.user?.id === userId
    
    if (!isSelf && !['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este usuário' },
        { status: 403 }
      )
    }

    // Remover senha da resposta
    const { password, ...userResponse } = user

    return NextResponse.json({
      success: true,
      data: userResponse
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
    const session = await getServerSession(authOptions)
    
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
    const isSelf = session.user?.id === userId
    
    if (!isSelf && !['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Sem permissão para atualizar este usuário' },
        { status: 403 }
      )
    }

    // Se está alterando email, verificar se já existe
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = Array.from(mockUsers.values()).some(
        user => user.email === updateData.email && user.id !== userId
      )

      if (emailExists) {
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
      updated_at: new Date().toISOString()
    }

    mockUsers.set(userId, updatedUser)

    // Remover senha da resposta
    const { password, ...userResponse } = updatedUser

    return NextResponse.json({
      success: true,
      data: userResponse,
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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Apenas SYSTEM_ADMIN pode deletar usuários
    if (session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar usuários' },
        { status: 403 }
      )
    }

    const userId = params.id

    // Verificar se usuário existe
    const existingUser = mockUsers.get(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir deletar a si mesmo
    if (session.user?.id === userId) {
      return NextResponse.json(
        { error: 'Você não pode deletar sua própria conta' },
        { status: 400 }
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
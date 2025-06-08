import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de perfil
const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  avatar: z.string().url('URL de avatar inválida').optional()
})

// Mock database - substituir por Prisma/banco real
const mockUsers = new Map()

// GET - Buscar perfil do usuário atual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Buscar usuário atual (substituir por query real)
    const user = mockUsers.get(session.user.id)

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Remover senha da resposta
    const { password, ...userResponse } = user

    return NextResponse.json({
      success: true,
      data: userResponse
    })

  } catch (error) {
    console.error('Erro ao buscar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar perfil do usuário atual
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar dados
    const validationResult = updateProfileSchema.safeParse(body)
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
    const existingUser = mockUsers.get(session.user.id)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Atualizar apenas campos permitidos do perfil
    const updatedUser = {
      ...existingUser,
      name: updateData.name || existingUser.name,
      telefone: updateData.telefone !== undefined ? updateData.telefone : existingUser.telefone,
      endereco: updateData.endereco !== undefined ? updateData.endereco : existingUser.endereco,
      avatar: updateData.avatar || existingUser.avatar,
      updated_at: new Date().toISOString()
    }

    mockUsers.set(session.user.id, updatedUser)

    // Remover senha da resposta
    const { password, ...userResponse } = updatedUser

    return NextResponse.json({
      success: true,
      data: userResponse,
      message: 'Perfil atualizado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { mockInstitutions, findInstitutionByEmail } from '../mockDatabase'

// Schema de validação para atualização de instituição
const updateInstitutionSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().min(10, 'Telefone inválido').optional(),
  address: z.object({
    street: z.string().min(3),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos')
  }).optional(),
  website: z.string().url().optional(),
  logo: z.string().url().optional(),
  type: z.enum(['PRIVATE', 'PUBLIC', 'MIXED']).optional(),
  active: z.boolean().optional(),
  settings: z.object({
    allowStudentRegistration: z.boolean().optional(),
    requireEmailVerification: z.boolean().optional(),
    maxSchools: z.number().int().positive().optional(),
    maxUsersPerSchool: z.number().int().positive().optional()
  }).optional()
})

// GET - Buscar instituição por ID
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

    const institutionId = params.id

    // Buscar instituição
    const institution = mockInstitutions.get(institutionId)

    if (!institution) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canViewDetails = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id === institutionId) ||
      (institution.active && session.user.institution_id === institutionId)

    if (!canViewDetails) {
      // Retornar apenas informações básicas
      return NextResponse.json({
        success: true,
        data: {
          id: institution.id,
          name: institution.name,
          type: institution.type,
          logo: institution.logo
        }
      })
    }

    // Adicionar estatísticas
    const institutionWithStats = {
      ...institution,
      schools_count: institution.schools?.length || 0,
      users_count: institution.users_count || 0,
      courses_count: institution.courses_count || 0,
      active_students: institution.active_students || 0
    }

    return NextResponse.json({
      success: true,
      data: institutionWithStats
    })

  } catch (error) {
    console.error('Erro ao buscar instituição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar instituição
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

    const institutionId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateInstitutionSchema.safeParse(body)
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

    // Buscar instituição existente
    const existingInstitution = mockInstitutions.get(institutionId)
    if (!existingInstitution) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && session.user.institution_id === institutionId)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta instituição' },
        { status: 403 }
      )
    }

    // Se está alterando email, verificar duplicação
    if (updateData.email && updateData.email !== existingInstitution.email) {
      const duplicateEmail = findInstitutionByEmail(updateData.email, institutionId)

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email já cadastrado para outra instituição' },
          { status: 409 }
        )
      }
    }

    // Atualizar instituição
    const updatedInstitution = {
      ...existingInstitution,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockInstitutions.set(institutionId, updatedInstitution)

    return NextResponse.json({
      success: true,
      data: updatedInstitution,
      message: 'Instituição atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar instituição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover instituição
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

    // Apenas SYSTEM_ADMIN pode deletar instituições
    if (session.user?.role !== 'SYSTEM_ADMIN') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar instituições' },
        { status: 403 }
      )
    }

    const institutionId = params.id

    // Buscar instituição
    const existingInstitution = mockInstitutions.get(institutionId)
    if (!existingInstitution) {
      return NextResponse.json(
        { error: 'Instituição não encontrada' },
        { status: 404 }
      )
    }

    // Verificar se tem escolas vinculadas
    if (existingInstitution.schools && existingInstitution.schools.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar instituição com escolas vinculadas' },
        { status: 409 }
      )
    }

    // Verificar se tem usuários ativos
    if (existingInstitution.users_count > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar instituição com usuários ativos' },
        { status: 409 }
      )
    }

    // Deletar instituição (em produção, seria soft delete)
    mockInstitutions.delete(institutionId)

    return NextResponse.json({
      success: true,
      message: 'Instituição removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar instituição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
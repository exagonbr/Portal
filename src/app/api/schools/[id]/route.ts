import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para atualização de escola
const updateSchoolSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  code: z.string().min(2, 'Código deve ter pelo menos 2 caracteres').optional(),
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
  principal_name: z.string().min(3).optional(),
  principal_email: z.string().email().optional(),
  type: z.enum(['elementary', 'middle', 'high', 'technical']).optional(),
  education_levels: z.array(z.enum(['INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'TECNICO', 'EJA'])).optional(),
  shifts: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_TIME'])).optional(),
  is_active: z.boolean().optional(),
  settings: z.object({
    maxStudentsPerClass: z.number().int().positive().optional(),
    allowOnlineClasses: z.boolean().optional(),
    hasLibrary: z.boolean().optional(),
    hasLab: z.boolean().optional(),
    hasSportsArea: z.boolean().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockSchools = new Map()

// GET - Buscar escola por ID
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

    const schoolId = params.id

    // Buscar escola
    const school = mockSchools.get(schoolId)

    if (!school) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canViewDetails = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && school.institution_id === session.user.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && school.id === session.user.school_id) ||
      (school.is_active && session.user.school_id === schoolId)

    if (!canViewDetails) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar esta escola' },
        { status: 403 }
      )
    }

    // Adicionar estatísticas
    const schoolWithStats = {
      ...school,
      students_count: school.students_count || 0,
      teachers_count: school.teachers_count || 0,
      classes_count: school.classes_count || 0,
      active_courses: school.active_courses || 0
    }

    return NextResponse.json({
      success: true,
      data: schoolWithStats
    })

  } catch (error) {
    console.error('Erro ao buscar escola:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar escola
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

    const schoolId = params.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateSchoolSchema.safeParse(body)
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

    // Buscar escola existente
    const existingSchool = mockSchools.get(schoolId)
    if (!existingSchool) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingSchool.institution_id === session.user.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && existingSchool.id === session.user.school_id)

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Sem permissão para editar esta escola' },
        { status: 403 }
      )
    }

    // Se está alterando código, verificar duplicação
    if (updateData.code && updateData.code !== existingSchool.code) {
      const duplicateCode = Array.from(mockSchools.values()).find(
        school => school.code === updateData.code && 
                  school.institution_id === existingSchool.institution_id &&
                  school.id !== schoolId
      )

      if (duplicateCode) {
        return NextResponse.json(
          { error: 'Já existe uma escola com este código nesta instituição' },
          { status: 409 }
        )
      }
    }

    // Se está alterando email, verificar duplicação
    if (updateData.email && updateData.email !== existingSchool.email) {
      const duplicateEmail = Array.from(mockSchools.values()).find(
        school => school.email === updateData.email && school.id !== schoolId
      )

      if (duplicateEmail) {
        return NextResponse.json(
          { error: 'Email já cadastrado para outra escola' },
          { status: 409 }
        )
      }
    }

    // Atualizar escola
    const updatedSchool = {
      ...existingSchool,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session.user?.id
    }

    mockSchools.set(schoolId, updatedSchool)

    return NextResponse.json({
      success: true,
      data: updatedSchool,
      message: 'Escola atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao atualizar escola:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover escola
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

    const schoolId = params.id

    // Buscar escola
    const existingSchool = mockSchools.get(schoolId)
    if (!existingSchool) {
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      (userRole === 'INSTITUTION_ADMIN' && existingSchool.institution_id === session.user.institution_id)

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar esta escola' },
        { status: 403 }
      )
    }

    // Verificar se tem turmas ativas
    if (existingSchool.classes_count > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar escola com turmas ativas' },
        { status: 409 }
      )
    }

    // Verificar se tem usuários ativos
    if (existingSchool.students_count > 0 || existingSchool.teachers_count > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar escola com usuários ativos' },
        { status: 409 }
      )
    }

    // Deletar escola (em produção, seria soft delete)
    mockSchools.delete(schoolId)

    return NextResponse.json({
      success: true,
      message: 'Escola removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar escola:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
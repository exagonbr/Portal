import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Dados mock locais para escolas (temporário para debug)
const mockSchools = new Map([
  ['school_1', {
    id: 'school_1',
    name: 'Escola Estadual Dom Pedro II',
    code: 'EEDP2',
    institution_id: 'inst_sabercon',
    type: 'elementary',
    description: 'Escola pública de ensino fundamental e médio',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234567',
    phone: '(11) 3456-7890',
    email: 'contato@eedp2.edu.br',
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }],
  ['school_2', {
    id: 'school_2',
    name: 'Colégio Particular Santa Clara',
    code: 'CPSC',
    institution_id: 'inst_sabercon',
    type: 'high',
    description: 'Colégio particular de ensino integral',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310100',
    phone: '(11) 9876-5432',
    email: 'secretaria@santaclara.edu.br',
    is_active: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }],
  ['school_3', {
    id: 'school_3',
    name: 'Centro de Educação Técnica',
    code: 'CET',
    institution_id: 'inst_ifsp',
    type: 'technical',
    description: 'Centro de educação técnica e profissionalizante',
    address: 'Rua Tecnológica, 500',
    city: 'Campinas',
    state: 'SP',
    zip_code: '13040123',
    phone: '(19) 3234-5678',
    email: 'contato@cet.edu.br',
    is_active: true,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2025-06-16T21:00:00Z'
  }]
]);

// Schema de validação para atualização de escola
const updateSchoolSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  code: z.string().min(2, 'Código deve ter pelo menos 2 caracteres').optional(),
  description: z.string().optional(),
  institution_id: z.string().uuid('ID de instituição inválido').optional(),
  type: z.enum(['elementary', 'middle', 'high', 'technical']).optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  is_active: z.boolean().optional(),
  // Campos complexos opcionais para compatibilidade futura
  principal_name: z.string().min(3).optional(),
  principal_email: z.string().email().optional(),
  education_levels: z.array(z.enum(['INFANTIL', 'FUNDAMENTAL_I', 'FUNDAMENTAL_II', 'MEDIO', 'TECNICO', 'EJA'])).optional(),
  shifts: z.array(z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'FULL_TIME'])).optional(),
  settings: z.object({
    maxStudentsPerClass: z.number().int().positive().optional(),
    allowOnlineClasses: z.boolean().optional(),
    hasLibrary: z.boolean().optional(),
    hasLab: z.boolean().optional(),
    hasSportsArea: z.boolean().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
// Os dados são importados do arquivo principal '../route'

// GET - Buscar escola por ID
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
    console.log('🔄 PUT /api/schools/[id] - Iniciando atualização de escola...');
    
    // Criar sessão mock para debug (sem validação)
    const session = {
      user: {
        id: 'debug_user',
        email: 'debug@example.com',
        role: 'SYSTEM_ADMIN'
      }
    };
    console.log('🔐 Usando sessão mock para debug:', session);

    const schoolId = params.id
    console.log('🏫 ID da escola a ser atualizada:', schoolId);
    
    const body = await request.json()
    console.log('📋 Dados recebidos:', body);

    // Validar dados
    const validationResult = updateSchoolSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('❌ Erro de validação:', validationResult.error.flatten().fieldErrors);
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }
    
    console.log('✅ Dados válidos:', validationResult.data);

    const updateData = validationResult.data

    // Buscar escola existente
    console.log('🔍 Procurando escola no mock database...');
    console.log('📊 Total de escolas no mock:', mockSchools.size);
    console.log('🔑 Chaves disponíveis:', Array.from(mockSchools.keys()));
    
    const existingSchool = mockSchools.get(schoolId)
    console.log('🏫 Escola encontrada:', existingSchool ? 'sim' : 'não');
    
    if (!existingSchool) {
      console.error('❌ Escola não encontrada para ID:', schoolId);
      return NextResponse.json(
        { error: 'Escola não encontrada' },
        { status: 404 }
      )
    }

    // Verificar permissões
    const userRole = session?.user?.role || 'DEBUG_USER'
    console.log('👤 Role do usuário:', userRole);
    
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'DEBUG_USER' || // Permitir para debug
      (userRole === 'INSTITUTION_ADMIN' && existingSchool.institution_id === session?.user?.institution_id) ||
      (userRole === 'SCHOOL_MANAGER' && existingSchool.id === session?.user?.school_id)

    console.log('🔐 Pode editar:', canEdit);
    
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
    console.log('🔄 Atualizando dados da escola...');
    const updatedSchool = {
      ...existingSchool,
      ...updateData,
      updated_at: new Date().toISOString(),
      updated_by: session?.user?.id || 'debug_user'
    }
    
    console.log('💾 Escola atualizada:', updatedSchool);

    mockSchools.set(schoolId, updatedSchool)
    console.log('✅ Escola salva no mock database');

    return NextResponse.json({
      success: true,
      data: updatedSchool,
      message: 'Escola atualizada com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar escola:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
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
    const session = await getAuthentication(request)
    
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Funções CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Schema de validação para atualização de grupo
const updateStudyGroupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').optional(),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').optional(),
  subject: z.string().min(2, 'Assunto deve ter pelo menos 2 caracteres').optional(),
  type: z.enum(['STUDY', 'PROJECT', 'RESEARCH', 'DISCUSSION', 'TUTORING']).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'CLASS_ONLY', 'INVITE_ONLY']).optional(),
  max_members: z.number().int().min(2).max(50).optional(),
  meeting_schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'AS_NEEDED']).optional(),
    day_of_week: z.number().int().min(0).max(6).optional(),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    duration_minutes: z.number().int().positive().optional(),
    location: z.string().optional(),
    online_meeting_url: z.string().url().optional()
  }).optional(),
  goals: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    type: z.enum(['DOCUMENT', 'LINK', 'VIDEO', 'BOOK', 'ARTICLE']),
    url: z.string().url().optional(),
    description: z.string().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  settings: z.object({
    auto_accept_members: z.boolean().optional(),
    require_approval: z.boolean().optional(),
    allow_member_invites: z.boolean().optional(),
    enable_chat: z.boolean().optional(),
    enable_forum: z.boolean().optional(),
    enable_file_sharing: z.boolean().optional(),
    notify_new_content: z.boolean().optional()
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockStudyGroups = new Map()
const mockGroupMembers = new Map()

// GET - Buscar grupo por ID

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
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id

    // Buscar grupo
    const group = mockStudyGroups.get(groupId)

    if (!group) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Buscar membros
    const members = mockGroupMembers.get(groupId) || []
    const userMembership = members.find((m: any) => m.user_id === session.user?.id)

    // Verificar permissões de visualização
    const userRole = session.user?.role
    const canView =
      group.visibility === 'PUBLIC' ||
      userRole === 'SYSTEM_ADMIN' ||
      userRole === 'INSTITUTION_MANAGER' ||
      !!userMembership ||
      (group.visibility === 'CLASS_ONLY' && group.class_id) // Verificar se está na turma

    if (!canView) {
      return NextResponse.json({ error: 'Sem permissão para visualizar este grupo' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Preparar informações do grupo
    const groupWithDetails = {
      ...group,
      member_count: members.length,
      members: userMembership ? members.map((m: any) => ({
        user_id: m.user_id,
        user_name: m.user_name,
        role: m.role,
        joined_at: m.joined_at,
        is_active: m.is_active,
        contribution_points: m.contribution_points
      })) : null,
      is_member: !!userMembership,
      user_role: userMembership?.role || null,
      user_joined_at: userMembership?.joined_at || null,
      is_full: members.length >= group.max_members,
      active_members: members.filter((m: any) => m.is_active).length,
      pending_requests: members.filter((m: any) => m.status === 'pending').length,
      can_join: !userMembership && members.length < group.max_members && group.is_active,
      can_edit: userMembership?.role === 'LEADER' || userRole === 'SYSTEM_ADMIN',
      can_delete: group.creator_id === session.user?.id || userRole === 'SYSTEM_ADMIN'
    }

    // Se não for membro, remover informações sensíveis
    if (!userMembership && userRole !== 'SYSTEM_ADMIN') {
      delete groupWithDetails.resources
      delete groupWithDetails.meeting_schedule?.online_meeting_url
    }

    return NextResponse.json({
      success: true,
      data: groupWithDetails
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao buscar grupo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// PUT - Atualizar grupo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id
    const body = await request.json()

    // Validar dados
    const validationResult = updateStudyGroupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json({
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const updateData = validationResult.data

    // Buscar grupo existente
    const existingGroup = mockStudyGroups.get(groupId)
    if (!existingGroup) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const members = mockGroupMembers.get(groupId) || []
    const userMembership = members.find((m: any) => m.user_id === session.user?.id)
    const userRole = session.user?.role
    
    const canEdit = 
      userRole === 'SYSTEM_ADMIN' ||
      (userMembership?.role === 'LEADER') ||
      (userMembership?.role === 'MODERATOR' && !['visibility', 'max_members'].some(field => (updateData as any)[field] !== undefined))

    if (!canEdit) {
      return NextResponse.json({ error: 'Sem permissão para editar este grupo' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Validar alteração de max_members
    if (updateData.max_members && updateData.max_members < members.length) {
      return NextResponse.json({ error: `Não é possível reduzir o limite para menos que o número atual de membros (${members.length}, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })` }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Atualizar grupo
    const updatedGroup = {
      ...existingGroup,
      ...updateData,
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    }

    mockStudyGroups.set(groupId, updatedGroup)

    return NextResponse.json({
      success: true,
      data: updatedGroup,
      message: 'Grupo atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao atualizar grupo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// DELETE - Remover grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const resolvedParams = await params
    const id = resolvedParams.id

    // Buscar grupo
    const existingGroup = mockStudyGroups.get(groupId)
    if (!existingGroup) {
      return NextResponse.json({ error: 'Grupo não encontrado' }, { 
      status: 404,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    const canDelete = 
      userRole === 'SYSTEM_ADMIN' ||
      existingGroup.creator_id === session.user?.id

    if (!canDelete) {
      return NextResponse.json({ error: 'Sem permissão para deletar este grupo' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se há atividade recente
    const lastActivity = new Date(existingGroup.last_activity_at)
    const daysSinceActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceActivity < 7) {
      return NextResponse.json({ error: 'Não é possível deletar grupo com atividade recente. Desative o grupo primeiro.' }, { 
      status: 409,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Notificar membros (em produção)
    const members = mockGroupMembers.get(groupId) || []
    // Enviar notificações para membros sobre exclusão do grupo

    // Deletar grupo e membros
    mockStudyGroups.delete(groupId)
    mockGroupMembers.delete(groupId)

    return NextResponse.json({
      success: true,
      message: 'Grupo removido com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('Erro ao deletar grupo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Schema de validação para criação de grupo de estudo
const createStudyGroupSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  subject: z.string().min(2, 'Assunto deve ter pelo menos 2 caracteres'),
  class_id: z.string().uuid('ID de turma inválido').optional(),
  course_id: z.string().uuid('ID de curso inválido').optional(),
  type: z.enum(['STUDY', 'PROJECT', 'RESEARCH', 'DISCUSSION', 'TUTORING']),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'CLASS_ONLY', 'INVITE_ONLY']).default('PUBLIC'),
  max_members: z.number().int().min(2).max(50).default(10),
  meeting_schedule: z.object({
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'AS_NEEDED']),
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
  settings: z.object({
    auto_accept_members: z.boolean().default(false),
    require_approval: z.boolean().default(true),
    allow_member_invites: z.boolean().default(true),
    enable_chat: z.boolean().default(true),
    enable_forum: z.boolean().default(true),
    enable_file_sharing: z.boolean().default(true),
    notify_new_content: z.boolean().default(true)
  }).optional()
})

// Mock database - substituir por Prisma/banco real
const mockStudyGroups = new Map()
const mockGroupMembers = new Map() // Relação grupo-membros

// GET - Listar grupos de estudo
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const visibility = searchParams.get('visibility')
    const class_id = searchParams.get('class_id')
    const course_id = searchParams.get('course_id')
    const my_groups = searchParams.get('my_groups') === 'true'
    const status = searchParams.get('status') // active, archived

    // Buscar grupos (substituir por query real)
    let groups = Array.from(mockStudyGroups.values())

    // Filtrar por grupos do usuário
    if (my_groups) {
      groups = groups.filter(group => {
        const members = mockGroupMembers.get(group.id) || []
        return members.some((m: any) => m.user_id === session.user?.id)
      })
    }

    // Aplicar filtros de visibilidade baseados no role
    const userRole = session.user?.role
    if (userRole === 'STUDENT') {
      groups = groups.filter(group => {
        // Aluno vê grupos públicos, da turma dele, ou que é membro
        if (group.visibility === 'PUBLIC') return true
        if (group.visibility === 'CLASS_ONLY' && group.class_id) {
          // Verificar se está na mesma turma
          return true // Implementar verificação real
        }
        const members = mockGroupMembers.get(group.id) || []
        return members.some((m: any) => m.user_id === session.user?.id)
      })
    }

    // Aplicar filtros de busca
    if (search) {
      const searchLower = search.toLowerCase()
      groups = groups.filter(group => 
        group.name.toLowerCase().includes(searchLower) ||
        group.description.toLowerCase().includes(searchLower) ||
        group.subject.toLowerCase().includes(searchLower) ||
        group.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      )
    }

    if (type) {
      groups = groups.filter(group => group.type === type)
    }

    if (visibility) {
      groups = groups.filter(group => group.visibility === visibility)
    }

    if (class_id) {
      groups = groups.filter(group => group.class_id === class_id)
    }

    if (course_id) {
      groups = groups.filter(group => group.course_id === course_id)
    }

    if (status) {
      groups = groups.filter(group => 
        status === 'active' ? group.is_active : !group.is_active
      )
    }

    // Adicionar informações de membros e status do usuário
    const groupsWithInfo = groups.map(group => {
      const members = mockGroupMembers.get(group.id) || []
      const userMembership = members.find((m: any) => m.user_id === session.user?.id)
      
      return {
        ...group,
        member_count: members.length,
        is_member: !!userMembership,
        user_role: userMembership?.role || null,
        user_joined_at: userMembership?.joined_at || null,
        is_full: members.length >= group.max_members,
        active_members: members.filter((m: any) => m.is_active).length,
        pending_requests: members.filter((m: any) => m.status === 'pending').length
      }
    })

    // Ordenar por atividade recente
    groupsWithInfo.sort((a, b) => 
      new Date(b.last_activity_at || b.created_at).getTime() - 
      new Date(a.last_activity_at || a.created_at).getTime()
    )

    // Paginação
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const paginatedGroups = groupsWithInfo.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: {
        items: paginatedGroups,
        pagination: {
          page,
          limit,
          total: groupsWithInfo.length,
          totalPages: Math.ceil(groupsWithInfo.length / limit)
        }
      }
    })

  } catch (error) {
    console.error('Erro ao listar grupos de estudo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar grupo de estudo
export async function POST(request: NextRequest) {
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
    const validationResult = createStudyGroupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const groupData = validationResult.data

    // Verificar permissões baseadas no tipo e visibilidade
    const userRole = session.user?.role
    
    // Estudantes só podem criar grupos públicos ou privados
    if (userRole === 'STUDENT' && ['CLASS_ONLY', 'INVITE_ONLY'].includes(groupData.visibility)) {
      return NextResponse.json(
        { error: 'Estudantes não podem criar grupos com esta visibilidade' },
        { status: 403 }
      )
    }

    // Se for grupo de turma, verificar se o usuário tem acesso à turma
    if (groupData.class_id) {
      // Implementar verificação se o usuário pertence à turma
      // Por enquanto, permitir
    }

    // Criar grupo
    const newGroup = {
      id: `group_${Date.now()}`,
      ...groupData,
      creator_id: session.user?.id,
      creator_name: session.user?.name,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    }

    mockStudyGroups.set(newGroup.id, newGroup)

    // Adicionar criador como líder do grupo
    const creatorMember = {
      user_id: session.user?.id,
      user_name: session.user?.name,
      role: 'LEADER',
      status: 'active',
      is_active: true,
      joined_at: new Date().toISOString(),
      contribution_points: 0
    }

    mockGroupMembers.set(newGroup.id, [creatorMember])

    return NextResponse.json({
      success: true,
      data: {
        ...newGroup,
        member_count: 1,
        is_member: true,
        user_role: 'LEADER'
      },
      message: 'Grupo de estudo criado com sucesso'
    }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar grupo de estudo:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 
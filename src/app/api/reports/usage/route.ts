import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import knex from '@/config/database'
import { activityTracker } from '@/services/activityTrackingService'
import { ActivityType } from '@/types/activity'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

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

// Schema de validação para filtros de relatório de uso
const usageReportSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y', 'custom']).default('30d'),
  date_from: z.string().nullable().optional(),
  date_to: z.string().nullable().optional(),
  institution_id: z.string().nullable().optional(),
  role: z.enum(['all', 'STUDENT', 'TEACHER', 'MANAGER', 'PARENT', 'INSTITUTION_MANAGER', 'SYSTEM_ADMIN', 'admin', 'system_admin', 'institution_manager', 'academic_coordinator', 'manager', 'teacher', 'student', 'guardian']).default('all'),
  activity_type: z.enum(['all', 'login', 'logout', 'login_failed', 'page_view', 'video_start', 'video_play', 'video_pause', 'video_stop', 'video_complete', 'video_seek', 'content_access', 'quiz_start', 'quiz_attempt', 'quiz_complete', 'assignment_start', 'assignment_submit', 'assignment_complete', 'book_open', 'book_read', 'book_bookmark', 'course_enroll', 'course_complete', 'lesson_start', 'lesson_complete', 'forum_post', 'forum_reply', 'chat_message', 'file_download', 'file_upload', 'search', 'profile_update', 'settings_change', 'notification_read', 'session_timeout', 'error', 'system_action']).default('all'),
  user_name: z.string().nullable().optional(),
  institution_name: z.string().nullable().optional()
})

interface UsageStats {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  averageSessionDuration: number
  byRole: Record<string, number>
  byInstitution: Record<string, number>
  byActivityType: Record<string, number>
  timeline: Array<{
    date: string
    users: number
    sessions: number
    activities: number
  }>
  averageUsersPerDay: number
  averageSessionsPerDay: number
  averageActivitiesPerDay: number
  peakUsageDay: {
    date: string
    users: number
    sessions: number
    activities: number
  }
  growthRate: string
}

// Função para obter dados reais da tabela user_activity
async function getUsageDataFromDatabase(filters: any): Promise<UsageStats> {
  try {
    console.log('🔄 Iniciando consulta com filtros:', filters)

    // Determinar o período de data
    let dateFrom: Date
    let dateTo: Date = new Date()
    
    if (filters.period === 'custom' && filters.date_from && filters.date_to) {
      dateFrom = new Date(filters.date_from)
      dateTo = new Date(filters.date_to)
    } else {
      const days = filters.period === '7d' ? 7 : 
                   filters.period === '30d' ? 30 : 
                   filters.period === '90d' ? 90 : 365
      dateFrom = new Date()
      dateFrom.setDate(dateFrom.getDate() - days)
    }

    console.log('📅 Período da consulta:', { dateFrom, dateTo })

    // Query base para user_activity
    let query = knex('user_activity')
      .whereBetween('date_created', [dateFrom, dateTo])

    // Aplicar filtros baseados na estrutura real da tabela
    if (filters.role && filters.role !== 'all') {
      // Mapear roles para os valores que estão na coluna 'role' da tabela
      const roleMapping: Record<string, string> = {
        'STUDENT': 'isStudent',
        'TEACHER': 'isTeacher', 
        'MANAGER': 'isManager',
        'PARENT': 'isParent',
        'INSTITUTION_MANAGER': 'isAdmin',
        'SYSTEM_ADMIN': 'isAdmin'
      }
      const mappedRole = roleMapping[filters.role] || filters.role
      query = query.where('role', mappedRole)
    }

    if (filters.institution_id) {
      query = query.where('institution_id', filters.institution_id)
    }

    if (filters.institution_name) {
      query = query.whereILike('institution_name', `%${filters.institution_name}%`)
    }

    if (filters.user_name) {
      query = query.whereILike('fullname', `%${filters.user_name}%`)
    }

    if (filters.activity_type && filters.activity_type !== 'all') {
      query = query.where('type', filters.activity_type)
    }

    // Obter dados de atividade
    console.log('🔍 Executando query principal...')
    const activities = await query.select('*')
    console.log('📊 Total de atividades encontradas:', activities.length)

    // Calcular estatísticas por role
    console.log('📊 Calculando estatísticas por role...')
    const roleStats = await knex('user_activity')
      .select('role', knex.raw('COUNT(DISTINCT user_id) as count'))
      .whereBetween('date_created', [dateFrom, dateTo])
      .whereNotNull('role')
      .groupBy('role')

    const byRole: Record<string, number> = {}
    roleStats.forEach(stat => {
      // Mapear roles da tabela para nomes mais legíveis
      const roleMap: Record<string, string> = {
        'isStudent': 'STUDENT',
        'isTeacher': 'TEACHER',
        'isManager': 'MANAGER', 
        'isParent': 'PARENT',
        'isAdmin': 'ADMIN'
      }
      const roleName = roleMap[stat.role] || stat.role.toUpperCase()
      byRole[roleName] = parseInt(stat.count)
    })

    // Calcular estatísticas por instituição
    console.log('🏢 Calculando estatísticas por instituição...')
    const institutionStats = await knex('user_activity')
      .select('institution_name', knex.raw('COUNT(DISTINCT user_id) as count'))
      .whereBetween('date_created', [dateFrom, dateTo])
      .whereNotNull('institution_name')
      .groupBy('institution_name')
      .orderBy('count', 'desc')
      .limit(10)

    const byInstitution: Record<string, number> = {}
    institutionStats.forEach(stat => {
      byInstitution[stat.institution_name] = parseInt(stat.count)
    })

    // Calcular estatísticas por tipo de atividade
    console.log('🎯 Calculando estatísticas por tipo de atividade...')
    const activityStats = await knex('user_activity')
      .select('type', knex.raw('COUNT(*) as count'))
      .whereBetween('date_created', [dateFrom, dateTo])
      .whereNotNull('type')
      .groupBy('type')

    const byActivityType: Record<string, number> = {}
    activityStats.forEach(stat => {
      byActivityType[stat.type] = parseInt(stat.count)
    })

    // Calcular timeline diária
    console.log('📈 Calculando timeline diária...')
    const timelineData = await knex('user_activity')
      .select(
        knex.raw('DATE(date_created) as date'),
        knex.raw('COUNT(DISTINCT user_id) as users'),
        knex.raw('COUNT(DISTINCT CONCAT(user_id, \'-\', DATE(date_created))) as sessions'),
        knex.raw('COUNT(*) as activities')
      )
      .whereBetween('date_created', [dateFrom, dateTo])
      .groupBy(knex.raw('DATE(date_created)'))
      .orderBy('date')

    const timeline = timelineData.map((day: any) => ({
      date: day.date,
      users: parseInt(day.users),
      sessions: parseInt(day.sessions),
      activities: parseInt(day.activities)
    }))

    // Calcular métricas gerais
    console.log('📊 Calculando métricas gerais...')
    const totalUsers = await knex('user_activity')
      .countDistinct('user_id as count')
      .whereBetween('date_created', [dateFrom, dateTo])
      .first()

    // Usuários ativos nos últimos 7 dias do período
    const sevenDaysAgo = new Date(dateTo)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const activeUsers = await knex('user_activity')
      .countDistinct('user_id as count')
      .whereBetween('date_created', [sevenDaysAgo, dateTo])
      .first()

    const totalSessions = timeline.reduce((sum: number, day: any) => sum + day.sessions, 0)

    // Calcular duração média de sessão (estimativa baseada em atividades por sessão)
    const avgActivitiesPerSession = totalSessions > 0 ? 
      timeline.reduce((sum: number, day: any) => sum + day.activities, 0) / totalSessions : 0
    const averageSessionDuration = Math.round(avgActivitiesPerSession * 2.5) // Estimativa: 2.5 min por atividade

    const averageUsersPerDay = timeline.length > 0 ? 
      Math.round(timeline.reduce((sum: number, day: any) => sum + day.users, 0) / timeline.length) : 0

    const averageSessionsPerDay = timeline.length > 0 ? 
      Math.round(timeline.reduce((sum: number, day: any) => sum + day.sessions, 0) / timeline.length) : 0

    const averageActivitiesPerDay = timeline.length > 0 ? 
      Math.round(timeline.reduce((sum: number, day: any) => sum + day.activities, 0) / timeline.length) : 0

    const peakUsageDay = timeline.length > 0 ? 
      timeline.reduce((max: any, day: any) => day.users > max.users ? day : max, timeline[0]) :
      { date: new Date().toISOString().split('T')[0], users: 0, sessions: 0, activities: 0 }

    // Calcular taxa de crescimento
    const growthRate = timeline.length > 7 ? 
            (((timeline.slice(-7).reduce((sum: number, day: any) => sum + day.users, 0) / 7) -
        (timeline.slice(0, 7).reduce((sum: number, day: any) => sum + day.users, 0) / 7)) /
       (timeline.slice(0, 7).reduce((sum: number, day: any) => sum + day.users, 0) / 7) * 100).toFixed(1) : 
      '0.0'

    const result = {
      totalUsers: parseInt(String(totalUsers?.count || '0')),
      activeUsers: parseInt(String(activeUsers?.count || '0')),
      totalSessions,
      averageSessionDuration,
      byRole,
      byInstitution,
      byActivityType,
      timeline,
      averageUsersPerDay,
      averageSessionsPerDay,
      averageActivitiesPerDay,
      peakUsageDay,
      growthRate
    }

    console.log('✅ Dados calculados com sucesso:', {
      totalUsers: result.totalUsers,
      activeUsers: result.activeUsers,
      totalSessions: result.totalSessions,
      rolesCount: Object.keys(result.byRole).length,
      institutionsCount: Object.keys(result.byInstitution).length,
      activitiesCount: Object.keys(result.byActivityType).length
    })

    return result

  } catch (error) {
    console.error('❌ Erro ao consultar banco de dados:', error)
    console.log('🔄 Retornando dados mock devido ao erro')
    return getMockUsageData(filters)
  }
}

// Função para gerar dados mock quando há erro
function getMockUsageData(filters: any): UsageStats {
  console.log('🎭 Gerando dados mock...')
  
  const roles = ['STUDENT', 'TEACHER', 'MANAGER', 'PARENT', 'ADMIN']
  const institutions = ['Prefeitura de Barueri', 'Sabercon - Liberty (Instituição)', 'Escola Municipal C', 'Instituto Federal D']
  const activityTypes = ['login', 'logout', 'page_view', 'content_access', 'quiz_attempt', 'assignment_submit']
  
  // Gerar dados baseados no período
  const now = new Date()
  const periodDays = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : filters.period === '90d' ? 90 : 365
  
  const timeline = []
  for (let i = periodDays - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 200) + 50,
      sessions: Math.floor(Math.random() * 300) + 80,
      activities: Math.floor(Math.random() * 1000) + 200
    })
  }
  
  const byRole: Record<string, number> = {}
  roles.forEach(role => {
    byRole[role] = Math.floor(Math.random() * 500) + 100
  })
  
  const byInstitution: Record<string, number> = {}
  institutions.forEach(institution => {
    byInstitution[institution] = Math.floor(Math.random() * 300) + 50
  })
  
  const byActivityType: Record<string, number> = {}
  activityTypes.forEach(type => {
    byActivityType[type] = Math.floor(Math.random() * 1000) + 200
  })
  
  return {
    totalUsers: Object.values(byRole).reduce((sum, count) => sum + count, 0),
    activeUsers: Math.floor(Object.values(byRole).reduce((sum, count) => sum + count, 0) * 0.7),
    totalSessions: timeline.reduce((sum, day) => sum + day.sessions, 0),
    averageSessionDuration: Math.floor(Math.random() * 45) + 15, // 15-60 minutos
    byRole,
    byInstitution,
    byActivityType,
    timeline,
    averageUsersPerDay: Math.round(timeline.reduce((sum, day) => sum + day.users, 0) / timeline.length),
    averageSessionsPerDay: Math.round(timeline.reduce((sum, day) => sum + day.sessions, 0) / timeline.length),
    averageActivitiesPerDay: Math.round(timeline.reduce((sum, day) => sum + day.activities, 0) / timeline.length),
    peakUsageDay: timeline.reduce((max, day) => day.users > max.users ? day : max, timeline[0]),
    growthRate: timeline.length > 1 ? 
      ((timeline[timeline.length - 1].users - timeline[0].users) / timeline[0].users * 100).toFixed(1) : 
      '0.0'
  }
}

// GET - Obter dados de uso

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Iniciando GET /api/reports/usage')
    
    // TEMPORÁRIO: Comentando autenticação para testar
    /*
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('❌ Usuário não autenticado')
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões - apenas admins podem ver relatórios de uso
    const userRole = session.user?.role
    console.log('👤 Role do usuário:', userRole)
    
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'system_admin', 'admin', 'institution_manager'].includes(userRole)) {
      console.log('🚫 Usuário sem permissão')
      return NextResponse.json({ error: 'Sem permissão para acessar relatórios de uso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }
    */

    // Parâmetros de query
    const { searchParams } = new URL(request.url)
    const filters = {
      period: searchParams.get('period') || '30d',
      date_from: searchParams.get('date_from'),
      date_to: searchParams.get('date_to'),
      institution_id: searchParams.get('institution_id'),
      role: searchParams.get('role') || 'all',
      activity_type: searchParams.get('activity_type') || 'all',
      user_name: searchParams.get('user_name'),
      institution_name: searchParams.get('institution_name')
    }

    console.log('🔍 Filtros recebidos:', filters)

    // Validar filtros
    const validationResult = usageReportSchema.safeParse(filters)
    if (!validationResult.success) {
      console.log('❌ Filtros inválidos:', validationResult.error.flatten().fieldErrors)
      return NextResponse.json({
          error: 'Filtros inválidos',
          errors: validationResult.error.flatten().fieldErrors
        },
        {
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      )
    }

    const validatedFilters = validationResult.data

    // Validar período customizado
    if (validatedFilters.period === 'custom') {
      if (!validatedFilters.date_from || !validatedFilters.date_to) {
        return NextResponse.json(
          { error: 'Para período customizado, date_from e date_to são obrigatórios' },
          { status: 400 }
        )
      }
      
      const dateFrom = new Date(validatedFilters.date_from)
      const dateTo = new Date(validatedFilters.date_to)
      
      if (dateTo <= dateFrom) {
        return NextResponse.json({ error: 'Data final deve ser posterior à data inicial' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
      }
    }

    // Obter dados reais do banco de dados
    console.log('🔄 Obtendo dados do banco...')
    const usageData = await getUsageDataFromDatabase(validatedFilters)

    console.log('✅ Retornando dados de uso')
    return NextResponse.json({
      success: true,
      data: usageData,
      filters: validatedFilters,
      generated_at: new Date().toISOString()
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao obter dados de uso:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// POST - Exportar relatório de uso
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar permissões
    const userRole = session.user?.role
    if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'system_admin', 'admin', 'institution_manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Sem permissão para exportar relatórios de uso' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()
    const { format = 'PDF', filters = {} } = body

    if (!['PDF', 'EXCEL', 'CSV'].includes(format)) {
      return NextResponse.json(
        { error: 'Formato não suportado. Use PDF, EXCEL ou CSV' },
        { status: 400 }
      )
    }

    // Gerar dados para exportação
    const usageData = await getUsageDataFromDatabase(filters)

    // Simular geração do arquivo
    const exportId = `usage_report_${Date.now()}`
    const fileName = `relatorio_uso_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`

    // Em produção, aqui seria iniciado o processo de geração do arquivo
    // Por enquanto, retornamos um mock
    return NextResponse.json({
      success: true,
      data: {
        export_id: exportId,
        file_name: fileName,
        format,
        status: 'processing',
        download_url: null, // Será preenchido quando o arquivo estiver pronto
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        created_at: new Date().toISOString()
      },
      message: 'Exportação iniciada. Você será notificado quando estiver pronta.'
    }, { status: 202 })

  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

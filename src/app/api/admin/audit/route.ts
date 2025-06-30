import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserRole } from '@/types/roles'
import knex from '@/config/database'


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    // Verificar se o usuário tem permissão para ver logs de auditoria
    const userRoles = [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER]
    const hasPermission = userRoles.some((role: UserRole) =>
      role === session.user.role
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const activityType = searchParams.get('activity_type') || 'all'
    const severity = searchParams.get('severity') || 'all'
    const userId = searchParams.get('user_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    const offset = (page - 1) * limit

    // Construir query base
    let query = knex('user_activity as ua')
      .leftJoin('users as u', 'ua.user_id', 'u.id')
      .select([
        'ua.id',
        'ua.user_id',
        'u.name as user_name',
        'u.email as user_email',
        'ua.activity_type',
        'ua.entity_type',
        'ua.entity_id',
        'ua.action',
        'ua.details',
        'ua.ip_address',
        'ua.user_agent',
        'ua.device_info',
        'ua.browser',
        'ua.operating_system',
        'ua.location',
        'ua.duration_seconds',
        'ua.start_time',
        'ua.end_time',
        'ua.session_id',
        'ua.created_at',
        'ua.updated_at'
      ])
      .orderBy('ua.created_at', 'desc')

    // Aplicar filtros
    if (activityType !== 'all') {
      if (activityType === 'LOGIN') {
        query = query.where('ua.activity_type', 'like', '%login%')
      } else if (activityType === 'VIDEO') {
        query = query.where('ua.activity_type', 'like', 'video_%')
      } else if (activityType === 'QUIZ') {
        query = query.where('ua.activity_type', 'like', 'quiz_%')
      } else if (activityType === 'ASSIGNMENT') {
        query = query.where('ua.activity_type', 'like', 'assignment_%')
      } else if (activityType === 'SYSTEM') {
        query = query.where('ua.activity_type', 'like', 'system_%')
      } else {
        query = query.where('ua.activity_type', activityType)
      }
    }

    if (userId) {
      query = query.where('ua.user_id', userId)
    }

    if (startDate) {
      query = query.where('ua.created_at', '>=', startDate)
    }

    if (endDate) {
      query = query.where('ua.created_at', '<=', endDate)
    }

    // Contar total de registros
    const totalQuery = query.clone().clearSelect().clearOrder().count('* as total')
    const [{ total }] = await totalQuery

    // Buscar registros paginados
    const logs = await query.limit(limit).offset(offset)

    // Processar logs para adicionar informações de severidade
    const processedLogs = logs.map(log => {
      let severity = 'info'
      
      // Determinar severidade baseada no tipo de atividade
      if (log.activity_type?.includes('error') || log.activity_type === 'login_failed') {
        severity = 'error'
      } else if (log.activity_type?.includes('warning') || 
                 log.activity_type === 'logout' || 
                 log.activity_type?.includes('delete')) {
        severity = 'warning'
      }

      // Formatar detalhes se for JSON
      let details = log.details
      if (typeof details === 'object' && details !== null) {
        details = JSON.stringify(details, null, 2)
      }

      return {
        id: log.id,
        timestamp: log.created_at,
        user: log.user_name || log.user_email || log.user_id,
        user_email: log.user_email,
        action: log.activity_type || log.action,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        resource: log.entity_type ? `${log.entity_type}${log.entity_id ? ` - ${log.entity_id}` : ''}` : 'Sistema',
        details: details || log.action,
        ip: log.ip_address,
        user_agent: log.user_agent,
        browser: log.browser,
        operating_system: log.operating_system,
        location: log.location,
        duration_seconds: log.duration_seconds,
        session_id: log.session_id,
        severity
      }
    })

    // Aplicar filtro de severidade após processamento
    const filteredLogs = severity === 'all' 
      ? processedLogs 
      : processedLogs.filter(log => log.severity === severity)

    return NextResponse.json({
      logs: filteredLogs,
      pagination: {
        page,
        limit,
        total: parseInt(total as string, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
        totalPages: Math.ceil(parseInt(total as string) / limit)
      }
    })

  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
}

// Endpoint para buscar estatísticas de auditoria
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { 
      status: 401,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const userRoles = Array.isArray(session.user.role) ? session.user.role : [session.user.role]
    const hasPermission = userRoles.some(role => 
      [UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER].includes(role as UserRole)
    )

    if (!hasPermission) {
      return NextResponse.json({ error: 'Acesso negado' }, { 
      status: 403,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
    }

    const body = await request.json()
    const { startDate, endDate } = body

    // Estatísticas gerais
    let statsQuery = knex('user_activity')
    
    if (startDate) {
      statsQuery = statsQuery.where('created_at', '>=', startDate)
    }
    
    if (endDate) {
      statsQuery = statsQuery.where('created_at', '<=', endDate)
    }

    const [
      totalActivities,
      uniqueUsers,
      uniqueSessions,
      loginCount,
      videoActivities,
      quizActivities,
      assignmentActivities,
      errorCount
    ] = await Promise.all([
      statsQuery.clone().count('* as total').first(),
      statsQuery.clone().countDistinct('user_id as total').first(),
      statsQuery.clone().countDistinct('session_id as total').first(),
      statsQuery.clone().where('activity_type', 'like', '%login%').count('* as total').first(),
      statsQuery.clone().where('activity_type', 'like', 'video_%').count('* as total').first(),
      statsQuery.clone().where('activity_type', 'like', 'quiz_%').count('* as total').first(),
      statsQuery.clone().where('activity_type', 'like', 'assignment_%').count('* as total').first(),
      statsQuery.clone().where('activity_type', 'like', '%error%').count('* as total').first()
    ])

    // Atividades por dia (últimos 7 dias)
    const dailyActivities = await knex('user_activity')
      .select(knex.raw('DATE(created_at) as date'))
      .count('* as count')
      .where('created_at', '>=', knex.raw('CURRENT_DATE - INTERVAL \'7 days\''))
      .groupBy(knex.raw('DATE(created_at)'))
      .orderBy('date', 'desc')

    // Top usuários mais ativos
    const topUsers = await knex('user_activity as ua')
      .leftJoin('users as u', 'ua.user_id', 'u.id')
      .select('ua.user_id', 'u.name', 'u.email')
      .count('* as activity_count')
      .groupBy('ua.user_id', 'u.name', 'u.email')
      .orderBy('activity_count', 'desc')
      .limit(10)

    return NextResponse.json({
      stats: {
        totalActivities: parseInt(totalActivities?.total as string || '0', {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
        uniqueUsers: parseInt(uniqueUsers?.total as string || '0'),
        uniqueSessions: parseInt(uniqueSessions?.total as string || '0'),
        loginCount: parseInt(loginCount?.total as string || '0'),
        videoActivities: parseInt(videoActivities?.total as string || '0'),
        quizActivities: parseInt(quizActivities?.total as string || '0'),
        assignmentActivities: parseInt(assignmentActivities?.total as string || '0'),
        errorCount: parseInt(errorCount?.total as string || '0')
      },
      dailyActivities,
      topUsers
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })
  }
} 
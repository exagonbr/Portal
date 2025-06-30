import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { activityTracker } from '@/services/activityTrackingService'
import { CreateActivityData, ActivityType } from '@/types/activity'
import { z } from 'zod'
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Função para criar headers CORS
function getCorsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  }
}

// Função para resposta OPTIONS
function createCorsOptionsResponse(origin?: string) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin)
  })
}

// Schema de validação para rastreamento de atividade
const trackActivitySchema = z.object({
  user_id: z.string(),
  activity_type: z.enum([
    'login', 'logout', 'login_failed', 'page_view', 'video_start', 'video_play', 
    'video_pause', 'video_stop', 'video_complete', 'video_seek', 'content_access',
    'quiz_start', 'quiz_attempt', 'quiz_complete', 'assignment_start', 
    'assignment_submit', 'assignment_complete', 'book_open', 'book_read', 
    'book_bookmark', 'course_enroll', 'course_complete', 'lesson_start', 
    'lesson_complete', 'forum_post', 'forum_reply', 'chat_message', 
    'file_download', 'file_upload', 'search', 'profile_update', 'settings_change',
    'notification_read', 'session_timeout', 'error', 'system_action'
  ]),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  action: z.string(),
  details: z.record(z.any()).optional(),
  duration_seconds: z.number().optional(),
  session_id: z.string().optional()
})


// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parsear e validar dados
    const body = await request.json()
    const validatedData = trackActivitySchema.parse(body)

    // Obter informações da requisição
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Preparar dados de atividade
    const activityData: CreateActivityData = {
      user_id: validatedData.user_id,
      activity_type: validatedData.activity_type as ActivityType,
      entity_type: validatedData.entity_type,
      entity_id: validatedData.entity_id,
      action: validatedData.action,
      details: {
        ...validatedData.details,
        ip_address: ip,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      },
      duration_seconds: validatedData.duration_seconds,
      session_id: validatedData.session_id
    }

    // Rastrear atividade
    await activityTracker.trackActivity(activityData)

    return NextResponse.json({
      success: true,
      message: 'Atividade registrada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao rastrear atividade:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados inválidos',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

// Endpoint para obter atividades do usuário
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || session.user.id
    const activityType = searchParams.get('activity_type')
    const entityType = searchParams.get('entity_type')
    const entityId = searchParams.get('entity_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar se o usuário pode acessar as atividades
    const isAdmin = session.user.role === 'SYSTEM_ADMIN'
    if (!isAdmin && userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Construir filtros
    const filter = {
      user_id: userId,
      activity_type: activityType as ActivityType,
      entity_type: entityType || undefined,
      entity_id: entityId || undefined,
      date_from: dateFrom ? new Date(dateFrom) : undefined,
      date_to: dateTo ? new Date(dateTo) : undefined,
      page,
      limit
    }

    // Obter atividades
    const result = await activityTracker.getUserActivities(filter)

    return NextResponse.json({
      success: true,
      data: result
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.error('❌ Erro ao obter atividades:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 

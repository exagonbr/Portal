import { NextRequest, NextResponse } from 'next/server'
import { activityTracker } from '@/services/activityTrackingService'
import { ActivityType } from '@/types/activity'
import { z } from 'zod'
import { validateJWTToken } from '@/lib/auth-utils'

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
  user_id: z.string().min(1, { message: "user_id não pode ser vazio" }),
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

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  const session = await validateJWTToken(token);
  return session;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Parsear e validar dados
    const body = await request.json()
    
    // Verificar se user_id existe e não é vazio
    if (!body.user_id || body.user_id === '') {
      console.log('❌ Ignorando log de atividade: user_id é nulo ou vazio')
      return NextResponse.json(
        { success: false, error: 'user_id é obrigatório e não pode ser vazio' },
        { status: 400 }
      )
    }
    
    const validatedData = trackActivitySchema.parse(body)

    // Obter informações da requisição
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Mapear ação para um tipo compatível
    let action: 'view' | 'complete' | 'pause' | 'resume' = 'view';
    if (validatedData.action === 'complete' || validatedData.activity_type.includes('complete')) {
      action = 'complete';
    } else if (validatedData.action === 'pause' || validatedData.activity_type.includes('pause')) {
      action = 'pause';
    } else if (validatedData.action === 'resume' || validatedData.activity_type.includes('resume')) {
      action = 'resume';
    }

    // Mapear tipo de conteúdo
    let contentType: 'video' | 'book' | 'course' | 'tvshow' = 'video';
    if (validatedData.entity_type === 'book' || validatedData.activity_type.includes('book')) {
      contentType = 'book';
    } else if (validatedData.entity_type === 'course' || validatedData.activity_type.includes('course')) {
      contentType = 'course';
    } else if (validatedData.entity_type === 'tvshow' || validatedData.activity_type.includes('tv')) {
      contentType = 'tvshow';
    }

    // Preparar dados de atividade no formato esperado pelo serviço
    const activityData = {
      userId: validatedData.user_id,
      contentId: validatedData.entity_id || 'unknown',
      contentType,
      action,
      progress: validatedData.details?.progress,
      duration: validatedData.duration_seconds,
      timestamp: new Date()
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
    console.log('❌ Erro ao rastrear atividade:', error)
    
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
    const session = await authenticate(request);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Obter parâmetros da query
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id') || session.user.id
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verificar se o usuário pode acessar as atividades
    const isAdmin = session.user.role === 'SYSTEM_ADMIN'
    if (!isAdmin && userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Obter atividades
    const result = await activityTracker.getUserActivity(userId, limit)

    return NextResponse.json({
      success: true,
      data: result
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('❌ Erro ao obter atividades:', error)

    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}

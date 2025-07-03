import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { activityTracker } from '@/services/activityTrackingService'
import { ViewingStatus } from '@/types/activity'
import { z } from 'zod'

// Schema de validação para viewing status
const viewingStatusSchema = z.object({
  user_id: z.string(),
  video_id: z.number(),
  tv_show_id: z.number().optional(),
  profile_id: z.string().optional(),
  current_play_time: z.number().min(0),
  runtime: z.number().min(0).optional(),
  completed: z.boolean().default(false),
  watch_percentage: z.number().min(0).max(100).default(0),
  last_position: z.number().min(0).optional(),
  quality: z.string().optional(),
  playback_speed: z.number().min(0.25).max(3).default(1),
  subtitle_language: z.string().optional(),
  audio_language: z.string().optional(),
  device_type: z.string().default('web')
})

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
    const validatedData = viewingStatusSchema.parse(body)

    // Verificar se o usuário pode atualizar este viewing status
    if (validatedData.user_id !== session.user.id) {
      const isAdmin = session.user.role === 'SYSTEM_ADMIN'
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }
    }

    // Atualizar viewing status
    await activityTracker.updateViewingStatus(validatedData)

    return NextResponse.json({
      success: true,
      message: 'Status de visualização atualizado com sucesso'
    })

  } catch (error) {
    console.error('❌ Erro ao atualizar viewing status:', error)
    
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
    const videoId = searchParams.get('video_id')

    if (!videoId) {
      return NextResponse.json(
        { success: false, error: 'video_id é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se o usuário pode acessar este viewing status
    if (userId !== session.user.id) {
      const isAdmin = session.user.role === 'SYSTEM_ADMIN'
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }
    }

    // Obter viewing status
    const viewingStatus = await activityTracker.getViewingStatus(userId, parseInt(videoId))

    return NextResponse.json({
      success: true,
      data: viewingStatus
    })

  } catch (error) {
    console.error('❌ Erro ao obter viewing status:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
} 
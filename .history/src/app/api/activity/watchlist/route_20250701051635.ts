import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { activityTracker } from '@/services/activityTrackingService'
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

// Schema de validação para watchlist
const watchlistSchema = z.object({
  user_id: z.string(),
  video_id: z.number().optional(),
  tv_show_id: z.number().optional(),
  notes: z.string().optional()
}).refine(data => data.video_id || data.tv_show_id, {
  message: "Pelo menos video_id ou tv_show_id deve ser fornecido"
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
    const validatedData = watchlistSchema.parse(body)

    // Verificar se o usuário pode modificar esta watchlist
    if (validatedData.user_id !== session.user.id) {
      const isAdmin = session.user.role === 'SYSTEM_ADMIN'
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }
    }

    // Adicionar à watchlist
    await activityTracker.addToWatchlist(
      validatedData.user_id,
      validatedData.video_id,
      validatedData.tv_show_id,
      validatedData.notes
    )

    return NextResponse.json({
      success: true,
      message: 'Item adicionado à watchlist com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('❌ Erro ao adicionar à watchlist:', error)
    
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

export async function DELETE(request: NextRequest) {
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
    const validatedData = z.object({
      user_id: z.string(),
      video_id: z.number().optional(),
      tv_show_id: z.number().optional()
    }).refine(data => data.video_id || data.tv_show_id, {
      message: "Pelo menos video_id ou tv_show_id deve ser fornecido"
    }).parse(body)

    // Verificar se o usuário pode modificar esta watchlist
    if (validatedData.user_id !== session.user.id) {
      const isAdmin = session.user.role === 'SYSTEM_ADMIN'
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Acesso negado' },
          { status: 403 }
        )
      }
    }

    // Remover da watchlist
    await activityTracker.removeFromWatchlist(
      validatedData.user_id,
      validatedData.video_id,
      validatedData.tv_show_id
    )

    return NextResponse.json({
      success: true,
      message: 'Item removido da watchlist com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    })

  } catch (error) {
    console.log('❌ Erro ao remover da watchlist:', error)
    
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

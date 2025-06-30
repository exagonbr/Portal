import { NextRequest, NextResponse } from 'next/server';
import { sessionService } from '../../../../services/sessionService';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// POST /api/sessions/validate - Valida uma sessão

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    // Verifica se a sessão é válida
    const isValid = await sessionService.isSessionValid(sessionId);
    
    if (!isValid) {
      return NextResponse.json(
        { valid: false, error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }

    // Recupera os dados da sessão
    const sessionData = await sessionService.getSession(sessionId);
    
    if (!sessionData) {
      return NextResponse.json(
        { valid: false, error: 'Dados da sessão não encontrados' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      session: {
        sessionId,
        userId: sessionData.userId,
        user: sessionData.user,
        lastActivity: new Date(sessionData.lastActivity, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    }),
      }
    });
  } catch (error) {
    console.error('Erro ao validar sessão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

// PUT /api/sessions/validate - Estende uma sessão
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, extendBy } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'ID da sessão é obrigatório' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }

    const success = await sessionService.extendSession(sessionId, extendBy);
    
    if (success) {
      return NextResponse.json({ 
        message: 'Sessão estendida com sucesso',
        extended: true 
      }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    } else {
      return NextResponse.json({ error: 'Falha ao estender sessão' }, { 
      status: 400,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
    }
  } catch (error) {
    console.error('Erro ao estender sessão:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { 
      status: 500,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });
  }
}

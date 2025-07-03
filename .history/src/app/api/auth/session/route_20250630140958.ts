import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCorsOptionsResponse, getCorsHeaders } from '../../../config/cors';
import * as jwt from 'jsonwebtoken';

// Tipos para sessão
interface SessionData {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  lastActivity: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSessionRequest {
  userId: string;
  token: string;
  refreshToken?: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt?: string;
}

interface UpdateSessionRequest {
  isActive?: boolean;
  lastActivity?: string;
  expiresAt?: string;
}

// Cache em memória para sessões (em produção, usar Redis ou banco de dados)
const sessionsCache = new Map<string, SessionData>();

// Função para gerar ID único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Função para extrair IP do request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (remoteAddr) {
    return remoteAddr;
  }
  return 'unknown';
}

// Função para validar token JWT
function validateJWT(token: string): { valid: boolean; payload?: any; error?: string } {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
    const payload = jwt.verify(token, JWT_SECRET);
    return { valid: true, payload };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Token inválido' 
    };
  }
}

// Função para limpar sessões expiradas
function cleanExpiredSessions(): void {
  const now = new Date();
  const entries = Array.from(sessionsCache.entries());
  for (const [sessionId, session] of entries) {
    if (session.expiresAt < now || !session.isActive) {
      sessionsCache.delete(sessionId);
    }
  }
}

// Nota: A limpeza de sessões é feita sob demanda nas operações

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// GET /api/auth/session - Obter sessão atual ou listar sessões
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const all = url.searchParams.get('all') === 'true';

    // Limpar sessões expiradas
    cleanExpiredSessions();

    // Se sessionId específico foi fornecido
    if (sessionId) {
      const session = sessionsCache.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Sessão não encontrada' },
          { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      // Verificar se a sessão ainda é válida
      if (session.expiresAt < new Date() || !session.isActive) {
        sessionsCache.delete(sessionId);
        return NextResponse.json(
          { success: false, message: 'Sessão expirada ou inativa' },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      return NextResponse.json({
        success: true,
        data: session
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Se userId foi fornecido, retornar sessões do usuário
    if (userId) {
      const userSessions = Array.from(sessionsCache.values())
        .filter(session => session.userId === userId && session.isActive);

      return NextResponse.json({
        success: true,
        data: userSessions,
        total: userSessions.length
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Se 'all' foi solicitado, retornar todas as sessões ativas (apenas para admins)
    if (all) {
      const cookieStore = await cookies();
      const authToken = cookieStore.get('auth_token')?.value;
      
      if (!authToken) {
        return NextResponse.json(
          { success: false, message: 'Token de autenticação necessário' },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      const tokenValidation = validateJWT(authToken);
      if (!tokenValidation.valid || !tokenValidation.payload) {
        return NextResponse.json(
          { success: false, message: 'Token inválido' },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      // Verificar se é admin
      const userRole = tokenValidation.payload.role;
      if (!['SYSTEM_ADMIN', 'INSTITUTION_ADMIN'].includes(userRole)) {
        return NextResponse.json(
          { success: false, message: 'Acesso negado' },
          { 
            status: 403,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      const allSessions = Array.from(sessionsCache.values())
        .filter(session => session.isActive);

      return NextResponse.json({
        success: true,
        data: allSessions,
        total: allSessions.length
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Tentar obter sessão atual dos cookies
    const cookieStore = await cookies();
    const sessionId_cookie = cookieStore.get('session_id')?.value;
    
    if (!sessionId_cookie) {
      return NextResponse.json(
        { success: false, message: 'Nenhuma sessão ativa encontrada' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const currentSession = sessionsCache.get(sessionId_cookie);
    if (!currentSession) {
      return NextResponse.json(
        { success: false, message: 'Sessão não encontrada' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Atualizar última atividade
    currentSession.lastActivity = new Date();
    currentSession.updatedAt = new Date();

    return NextResponse.json({
      success: true,
      data: currentSession
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// POST /api/auth/session - Criar nova sessão
export async function POST(request: NextRequest) {
  try {
    const body: CreateSessionRequest = await request.json();
    const { userId, token, refreshToken, userAgent, ipAddress, expiresAt } = body;

    // Validação básica
    if (!userId || !token) {
      return NextResponse.json(
        { success: false, message: 'userId e token são obrigatórios' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Validar token JWT
    const tokenValidation = validateJWT(token);
    if (!tokenValidation.valid) {
      return NextResponse.json(
        { success: false, message: `Token inválido: ${tokenValidation.error}` },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Gerar ID da sessão
    const sessionId = generateSessionId();

    // Obter informações do request
    const clientIP = ipAddress || getClientIP(request);
    const clientUserAgent = userAgent || request.headers.get('user-agent') || 'unknown';

    // Calcular data de expiração (padrão: 24 horas)
    const expirationDate = expiresAt 
      ? new Date(expiresAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Criar sessão
    const newSession: SessionData = {
      id: sessionId,
      userId,
      token,
      refreshToken,
      userAgent: clientUserAgent,
      ipAddress: clientIP,
      isActive: true,
      lastActivity: new Date(),
      expiresAt: expirationDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Armazenar sessão
    sessionsCache.set(sessionId, newSession);

    // Configurar cookie da sessão
    const cookieStore = await cookies();
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas (86400 segundos)
      path: '/',
    });

    console.log(`✅ Nova sessão criada: ${sessionId} para usuário ${userId}`);

    return NextResponse.json({
      success: true,
      data: newSession,
      message: 'Sessão criada com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT /api/auth/session - Atualizar sessão existente
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const body: UpdateSessionRequest = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'sessionId é obrigatório' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const session = sessionsCache.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Sessão não encontrada' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Atualizar campos fornecidos
    if (body.isActive !== undefined) {
      session.isActive = body.isActive;
    }
    if (body.lastActivity) {
      session.lastActivity = new Date(body.lastActivity);
    }
    if (body.expiresAt) {
      session.expiresAt = new Date(body.expiresAt);
    }

    session.updatedAt = new Date();

    // Atualizar no cache
    sessionsCache.set(sessionId, session);

    console.log(`✅ Sessão atualizada: ${sessionId}`);

    return NextResponse.json({
      success: true,
      data: session,
      message: 'Sessão atualizada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao atualizar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE /api/auth/session - Deletar/invalidar sessão
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const userId = url.searchParams.get('userId');
    const all = url.searchParams.get('all') === 'true';

    // Deletar sessão específica
    if (sessionId) {
      const session = sessionsCache.get(sessionId);
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Sessão não encontrada' },
          { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      // Marcar como inativa e remover do cache
      session.isActive = false;
      sessionsCache.delete(sessionId);

      // Limpar cookie se for a sessão atual
      const cookieStore = await cookies();
      const currentSessionId = cookieStore.get('session_id')?.value;
      if (currentSessionId === sessionId) {
        cookieStore.delete('session_id');
        cookieStore.delete('auth_token');
        cookieStore.delete('refresh_token');
        cookieStore.delete('user_data');
      }

      console.log(`✅ Sessão deletada: ${sessionId}`);

      return NextResponse.json({
        success: true,
        message: 'Sessão invalidada com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Deletar todas as sessões de um usuário
    if (userId) {
      let deletedCount = 0;
      const entries = Array.from(sessionsCache.entries());
      for (const [id, session] of entries) {
        if (session.userId === userId) {
          session.isActive = false;
          sessionsCache.delete(id);
          deletedCount++;
        }
      }

      console.log(`✅ ${deletedCount} sessões deletadas para usuário ${userId}`);

      return NextResponse.json({
        success: true,
        message: `${deletedCount} sessões invalidadas com sucesso`,
        deletedCount
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Deletar todas as sessões (apenas para admins)
    if (all) {
      const cookieStore = await cookies();
      const authToken = cookieStore.get('auth_token')?.value;
      
      if (!authToken) {
        return NextResponse.json(
          { success: false, message: 'Token de autenticação necessário' },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      const tokenValidation = validateJWT(authToken);
      if (!tokenValidation.valid || !tokenValidation.payload) {
        return NextResponse.json(
          { success: false, message: 'Token inválido' },
          { 
            status: 401,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      // Verificar se é admin
      const userRole = tokenValidation.payload.role;
      if (!['SYSTEM_ADMIN'].includes(userRole)) {
        return NextResponse.json(
          { success: false, message: 'Acesso negado' },
          { 
            status: 403,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      const totalSessions = sessionsCache.size;
      sessionsCache.clear();

      console.log(`✅ Todas as sessões foram invalidadas (${totalSessions} sessões)`);

      return NextResponse.json({
        success: true,
        message: `Todas as sessões foram invalidadas (${totalSessions} sessões)`,
        deletedCount: totalSessions
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Se nenhum parâmetro foi fornecido, invalidar sessão atual
    const cookieStore = await cookies();
    const currentSessionId = cookieStore.get('session_id')?.value;
    
    if (!currentSessionId) {
      return NextResponse.json(
        { success: false, message: 'Nenhuma sessão ativa encontrada' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const currentSession = sessionsCache.get(currentSessionId);
    if (currentSession) {
      currentSession.isActive = false;
      sessionsCache.delete(currentSessionId);
    }

    // Limpar cookies
    cookieStore.delete('session_id');
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');
    cookieStore.delete('user_data');

    console.log(`✅ Sessão atual invalidada: ${currentSessionId}`);

    return NextResponse.json({
      success: true,
      message: 'Sessão atual invalidada com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao deletar sessão:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      {
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
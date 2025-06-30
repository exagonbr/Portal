import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as jwt from 'jsonwebtoken';
import { createCorsOptionsResponse, getCorsHeaders } from '@/config/cors'

// Tipos para logs de autenticação
interface AuthLogEntry {
  id: string;
  userId?: string;
  email?: string;
  action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'TOKEN_REFRESH' | 'SESSION_EXPIRED' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED' | 'SUSPICIOUS_ACTIVITY';
  status: 'SUCCESS' | 'FAILED' | 'WARNING' | 'ERROR';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
  location?: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    os?: string;
    browser?: string;
  };
}

interface CreateLogRequest {
  userId?: string;
  email?: string;
  action: string;
  status: string;
  details?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

interface LogQueryParams {
  userId?: string;
  email?: string;
  action?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'action' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Cache em memória para logs (em produção, usar banco de dados)
const authLogsCache = new Map<string, AuthLogEntry>();

// Função para gerar ID único para log
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
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

// Função para extrair informações do dispositivo
function getDeviceInfo(userAgent: string): AuthLogEntry['deviceInfo'] {
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  let type: 'desktop' | 'mobile' | 'tablet' | 'unknown' = 'unknown';
  if (isTablet) {
    type = 'tablet';
  } else if (isMobile) {
    type = 'mobile';
  } else if (userAgent !== 'unknown') {
    type = 'desktop';
  }

  // Extrair OS
  let os = 'unknown';
  if (/Windows/i.test(userAgent)) os = 'Windows';
  else if (/Mac OS/i.test(userAgent)) os = 'macOS';
  else if (/Linux/i.test(userAgent)) os = 'Linux';
  else if (/Android/i.test(userAgent)) os = 'Android';
  else if (/iOS|iPhone|iPad/i.test(userAgent)) os = 'iOS';

  // Extrair Browser
  let browser = 'unknown';
  if (/Chrome/i.test(userAgent)) browser = 'Chrome';
  else if (/Firefox/i.test(userAgent)) browser = 'Firefox';
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = 'Safari';
  else if (/Edge/i.test(userAgent)) browser = 'Edge';
  else if (/Opera/i.test(userAgent)) browser = 'Opera';

  return { type, os, browser };
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

// Função para limpar logs antigos (manter apenas últimos 30 dias)
function cleanOldLogs(): void {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const entries = Array.from(authLogsCache.entries());
  
  for (const [logId, log] of entries) {
    if (log.timestamp < thirtyDaysAgo) {
      authLogsCache.delete(logId);
    }
  }
}

// Limpar logs antigos a cada 24 horas
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

// Função para criar log automaticamente
export function createAuthLog(
  action: AuthLogEntry['action'],
  status: AuthLogEntry['status'],
  request: NextRequest,
  options: {
    userId?: string;
    email?: string;
    details?: string;
    metadata?: Record<string, any>;
    sessionId?: string;
  } = {}
): string {
  const logId = generateLogId();
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  const logEntry: AuthLogEntry = {
    id: logId,
    userId: options.userId,
    email: options.email,
    action,
    status,
    ipAddress: getClientIP(request),
    userAgent,
    timestamp: new Date(),
    details: options.details,
    metadata: options.metadata,
    sessionId: options.sessionId,
    deviceInfo: getDeviceInfo(userAgent)
  };

  authLogsCache.set(logId, logEntry);
  
  // Log no console para debug
  console.log(`🔐 AUTH LOG [${status}]: ${action} - ${options.email || options.userId || 'unknown'} - ${logEntry.ipAddress}`);
  
  return logId;
}

// Handler para requisições OPTIONS (preflight)
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || undefined;
  return createCorsOptionsResponse(origin);
}

// GET /api/auth/_log - Obter logs de autenticação
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
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

    // Verificar permissões (apenas admins podem ver todos os logs)
    const userRole = tokenValidation.payload.role;
    const currentUserId = tokenValidation.payload.userId;
    const isAdmin = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(userRole);

    const url = new URL(request.url);
    const params: LogQueryParams = {
      userId: url.searchParams.get('userId') || undefined,
      email: url.searchParams.get('email') || undefined,
      action: url.searchParams.get('action') || undefined,
      status: url.searchParams.get('status') || undefined,
      startDate: url.searchParams.get('startDate') || undefined,
      endDate: url.searchParams.get('endDate') || undefined,
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: Math.min(parseInt(url.searchParams.get('limit') || '50'), 1000), // Máximo 1000
      sortBy: (url.searchParams.get('sortBy') as any) || 'timestamp',
      sortOrder: (url.searchParams.get('sortOrder') as any) || 'desc'
    };

    // Limpar logs antigos
    cleanOldLogs();

    // Filtrar logs
    let logs = Array.from(authLogsCache.values());

    // Se não é admin, só pode ver seus próprios logs
    if (!isAdmin) {
      logs = logs.filter(log => log.userId === currentUserId);
    }

    // Aplicar filtros
    if (params.userId) {
      logs = logs.filter(log => log.userId === params.userId);
    }
    if (params.email) {
      logs = logs.filter(log => log.email?.toLowerCase().includes(params.email!.toLowerCase()));
    }
    if (params.action) {
      logs = logs.filter(log => log.action === params.action);
    }
    if (params.status) {
      logs = logs.filter(log => log.status === params.status);
    }
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      logs = logs.filter(log => log.timestamp >= startDate);
    }
    if (params.endDate) {
      const endDate = new Date(params.endDate);
      logs = logs.filter(log => log.timestamp <= endDate);
    }

    // Ordenar
    logs.sort((a, b) => {
      const aValue = a[params.sortBy!];
      const bValue = b[params.sortBy!];
      
      if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Paginação
    const total = logs.length;
    const totalPages = Math.ceil(total / params.limit!);
    const skip = (params.page! - 1) * params.limit!;
    const paginatedLogs = logs.slice(skip, skip + params.limit!);

    // Estatísticas básicas (apenas para admins)
    let stats;
    if (isAdmin) {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentLogs = logs.filter(log => log.timestamp >= last24h);
      
      stats = {
        total: logs.length,
        last24h: recentLogs.length,
        byAction: logs.reduce((acc, log) => {
          acc[log.action] = (acc[log.action] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byStatus: logs.reduce((acc, log) => {
          acc[log.status] = (acc[log.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };
    }

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages
      },
      ...(stats && { stats })
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao obter logs:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// POST /api/auth/_log - Criar novo log de autenticação
export async function POST(request: NextRequest) {
  try {
    const body: CreateLogRequest = await request.json();
    const { userId, email, action, status, details, metadata, sessionId } = body;

    // Validação básica
    if (!action || !status) {
      return NextResponse.json(
        { success: false, message: 'action e status são obrigatórios' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Validar valores permitidos
    const validActions = ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH', 'SESSION_EXPIRED', 'PASSWORD_RESET', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY'];
    const validStatuses = ['SUCCESS', 'FAILED', 'WARNING', 'ERROR'];

    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, message: `action deve ser um dos valores: ${validActions.join(', ')}` },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, message: `status deve ser um dos valores: ${validStatuses.join(', ')}` },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Criar log
    const logId = createAuthLog(
      action as AuthLogEntry['action'],
      status as AuthLogEntry['status'],
      request,
      { userId, email, details, metadata, sessionId }
    );

    const createdLog = authLogsCache.get(logId);

    return NextResponse.json({
      success: true,
      data: createdLog,
      message: 'Log criado com sucesso'
    }, {
      status: 201,
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao criar log:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// PUT /api/auth/_log - Atualizar log existente (apenas para correções)
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação de admin
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
        { success: false, message: 'Acesso negado - apenas administradores do sistema' },
        { 
          status: 403,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const url = new URL(request.url);
    const logId = url.searchParams.get('logId');
    const body = await request.json();

    if (!logId) {
      return NextResponse.json(
        { success: false, message: 'logId é obrigatório' },
        { 
          status: 400,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const log = authLogsCache.get(logId);
    if (!log) {
      return NextResponse.json(
        { success: false, message: 'Log não encontrado' },
        { 
          status: 404,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    // Atualizar apenas campos permitidos (não alterar dados críticos como timestamp, IP, etc.)
    if (body.details !== undefined) {
      log.details = body.details;
    }
    if (body.metadata !== undefined) {
      log.metadata = { ...log.metadata, ...body.metadata };
    }

    // Atualizar no cache
    authLogsCache.set(logId, log);

    console.log(`✅ Log atualizado: ${logId} por admin ${tokenValidation.payload.email}`);

    return NextResponse.json({
      success: true,
      data: log,
      message: 'Log atualizado com sucesso'
    }, {
      headers: getCorsHeaders(request.headers.get('origin') || undefined)
    });

  } catch (error) {
    console.error('Erro ao atualizar log:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}

// DELETE /api/auth/_log - Deletar logs (apenas para admins)
export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticação de admin
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
        { success: false, message: 'Acesso negado - apenas administradores do sistema' },
        { 
          status: 403,
          headers: getCorsHeaders(request.headers.get('origin') || undefined)
        }
      );
    }

    const url = new URL(request.url);
    const logId = url.searchParams.get('logId');
    const olderThan = url.searchParams.get('olderThan'); // Data ISO string
    const all = url.searchParams.get('all') === 'true';

    // Deletar log específico
    if (logId) {
      const log = authLogsCache.get(logId);
      if (!log) {
        return NextResponse.json(
          { success: false, message: 'Log não encontrado' },
          { 
            status: 404,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      authLogsCache.delete(logId);

      console.log(`✅ Log deletado: ${logId} por admin ${tokenValidation.payload.email}`);

      return NextResponse.json({
        success: true,
        message: 'Log deletado com sucesso'
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Deletar logs mais antigos que uma data específica
    if (olderThan) {
      const cutoffDate = new Date(olderThan);
      if (isNaN(cutoffDate.getTime())) {
        return NextResponse.json(
          { success: false, message: 'Data inválida para olderThan' },
          { 
            status: 400,
            headers: getCorsHeaders(request.headers.get('origin') || undefined)
          }
        );
      }

      let deletedCount = 0;
      const entries = Array.from(authLogsCache.entries());
      
      for (const [id, log] of entries) {
        if (log.timestamp < cutoffDate) {
          authLogsCache.delete(id);
          deletedCount++;
        }
      }

      console.log(`✅ ${deletedCount} logs antigos deletados por admin ${tokenValidation.payload.email}`);

      return NextResponse.json({
        success: true,
        message: `${deletedCount} logs deletados com sucesso`,
        deletedCount
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    // Deletar todos os logs (operação perigosa)
    if (all) {
      const totalLogs = authLogsCache.size;
      authLogsCache.clear();

      console.log(`⚠️ TODOS OS LOGS DELETADOS (${totalLogs} logs) por admin ${tokenValidation.payload.email}`);

      return NextResponse.json({
        success: true,
        message: `Todos os logs foram deletados (${totalLogs} logs)`,
        deletedCount: totalLogs
      }, {
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      });
    }

    return NextResponse.json(
      { success: false, message: 'Parâmetro necessário: logId, olderThan ou all=true' },
      { 
        status: 400,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );

  } catch (error) {
    console.error('Erro ao deletar logs:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { 
        status: 500,
        headers: getCorsHeaders(request.headers.get('origin') || undefined)
      }
    );
  }
}
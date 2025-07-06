import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { getClientInfo } from '../utils/clientInfo';
import { UserActivity, ActivityType } from '../types/activity';

// Interface estendida para Request com informações de tracking
declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
      activityStartTime?: number;
      activityData?: Partial<UserActivity>;
    }
  }
}

// Mapeamento de rotas para tipos de atividade
const ROUTE_ACTIVITY_MAP: Record<string, ActivityType> = {
  // Auth
  '/auth/login': 'login',
  '/auth/logout': 'logout',
  '/auth/refresh': 'token_refresh',
  
  // Dashboard
  '/dashboard': 'page_view',
  '/dashboard/stats': 'stats_view',
  
  // Instituições
  '/institutions': 'page_view',
  '/institutions/create': 'data_create',
  '/institutions/update': 'data_update',
  '/institutions/delete': 'data_delete',
  
  // Usuários
  '/users': 'page_view',
  '/users/create': 'data_create',
  '/users/update': 'data_update',
  '/users/delete': 'data_delete',
  '/users/profile': 'profile_view',
  
  // Cursos
  '/courses': 'page_view',
  '/courses/create': 'data_create',
  '/courses/update': 'data_update',
  '/courses/delete': 'data_delete',
  
  // Conteúdo
  '/videos': 'content_access',
  '/modules': 'content_access',
  '/lessons': 'content_access',
  
  // AWS
  '/aws/connection-logs': 'system_action',
  '/aws/settings': 'settings_change',
  
  // Files
  '/files/upload': 'file_upload',
  '/files/download': 'file_download',
};

// Mapeamento de métodos HTTP para ações
const METHOD_ACTION_MAP: Record<string, string> = {
  'GET': 'view',
  'POST': 'create',
  'PUT': 'update',
  'PATCH': 'update',
  'DELETE': 'delete'
};

// Função para determinar o tipo de atividade baseado na rota
function getActivityType(path: string, method: string): ActivityType {
  // Verificar mapeamento direto
  for (const [route, type] of Object.entries(ROUTE_ACTIVITY_MAP)) {
    if (path.includes(route)) {
      return type;
    }
  }
  
  // Determinar por método HTTP
  if (method === 'GET') {
    if (path.includes('/stats') || path.includes('/analytics')) {
      return 'stats_view';
    }
    return 'page_view';
  }
  
  if (method === 'POST') {
    if (path.includes('/login')) return 'login';
    if (path.includes('/logout')) return 'logout';
    if (path.includes('/upload')) return 'file_upload';
    return 'data_create';
  }
  
  if (method === 'PUT' || method === 'PATCH') {
    return 'data_update';
  }
  
  if (method === 'DELETE') {
    return 'data_delete';
  }
  
  return 'system_action';
}

// Função para extrair entidade da rota
function extractEntityInfo(path: string): { entityType?: string; entityId?: string } {
  const segments = path.split('/').filter(Boolean);
  
  if (segments.length >= 2) {
    const entityType = segments[0];
    const entityId = segments.length >= 2 && !isNaN(Number(segments[1])) ? segments[1] : undefined;
    
    return { entityType, entityId };
  }
  
  return {};
}

// Função para criar log de atividade
async function createActivityLog(data: Partial<UserActivity>): Promise<void> {
  try {
    await db('user_activity').insert({
      id: uuidv4(),
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    });
  } catch (error) {
    console.error('Erro ao criar log de atividade:', error);
  }
}

// Middleware principal de tracking
export const activityTrackingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Iniciar tracking
  req.activityStartTime = Date.now();
  req.sessionId = req.sessionId || req.headers['x-session-id'] as string || uuidv4();
  
  // Extrair informações do cliente
  const clientInfo = getClientInfo(req);
  
  // Determinar tipo de atividade
  const activityType = getActivityType(req.path, req.method);
  
  // Extrair informações da entidade
  const { entityType, entityId } = extractEntityInfo(req.path);
  
  // Preparar dados da atividade
  req.activityData = {
    user_id: (req.user as any)?.id || 'anonymous',
    session_id: req.sessionId,
    activity_type: activityType,
    entity_type: entityType,
    entity_id: entityId,
    action: METHOD_ACTION_MAP[req.method] || req.method.toLowerCase(),
    ip_address: clientInfo.ip,
    user_agent: clientInfo.userAgent,
    browser: clientInfo.browser,
    operating_system: clientInfo.os,
    device_info: clientInfo.device,
    location: clientInfo.location,
    start_time: new Date(),
    details: {
      method: req.method,
      path: req.path,
      query: req.query,
      headers: {
        referer: req.headers.referer,
        origin: req.headers.origin,
        'content-type': req.headers['content-type']
      }
    }
  };
  
  // Interceptar resposta para capturar dados finais
  const originalSend = res.send;
  const originalJson = res.json;
  
  // Override send
  res.send = function(data: any): Response {
    res.send = originalSend;
    handleResponse(req, res, data);
    return originalSend.call(this, data);
  };
  
  // Override json
  res.json = function(data: any): Response {
    res.json = originalJson;
    handleResponse(req, res, data);
    return originalJson.call(this, data);
  };
  
  next();
};

// Função para processar resposta e finalizar tracking
async function handleResponse(req: Request, res: Response, responseData: any): Promise<void> {
  if (!req.activityData || !req.activityStartTime) return;
  
  const duration = Math.round((Date.now() - req.activityStartTime) / 1000);
  
  // Atualizar dados da atividade
  const activityData: Partial<UserActivity> = {
    ...req.activityData,
    duration_seconds: duration,
    end_time: new Date(),
    details: {
      ...req.activityData.details,
      status_code: res.statusCode,
      success: res.statusCode >= 200 && res.statusCode < 400,
      error: res.statusCode >= 400 ? responseData?.error || responseData?.message : undefined,
      response_size: JSON.stringify(responseData).length
    }
  };
  
  // Adicionar informações específicas baseadas no tipo de atividade
  if (req.activityData.activity_type === 'login' && res.statusCode === 200) {
    activityData.details = {
      ...activityData.details,
      login_method: req.body?.method || 'standard',
      remember_me: req.body?.remember_me || false
    };
  }
  
  if (req.activityData.activity_type === 'data_create' || 
      req.activityData.activity_type === 'data_update') {
    // Não incluir dados sensíveis como senhas
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.secret;
    
    activityData.details = {
      ...activityData.details,
      data_fields: Object.keys(sanitizedBody),
      data_size: JSON.stringify(sanitizedBody).length
    };
  }
  
  if (req.activityData.activity_type === 'file_upload' || 
      req.activityData.activity_type === 'file_download') {
    activityData.details = {
      ...activityData.details,
      file_name: req.body?.filename || req.query?.filename,
      file_size: req.body?.size || req.headers['content-length'],
      file_type: req.body?.mimetype || req.headers['content-type']
    };
  }
  
  // Criar log de atividade
  await createActivityLog(activityData);
  
  // Atualizar sessão ativa
  await updateActiveSession(req.sessionId!, (req.user as any)?.id || 'anonymous', duration);
}

// Função para atualizar sessão ativa
async function updateActiveSession(
  sessionId: string, 
  userId: string, 
  additionalDuration: number
): Promise<void> {
  try {
    const existingSession = await db('activity_sessions')
      .where({ session_id: sessionId })
      .first();
    
    if (existingSession) {
      // Atualizar sessão existente
      await db('activity_sessions')
        .where({ session_id: sessionId })
        .update({
          last_activity: new Date(),
          duration_seconds: (existingSession.duration_seconds || 0) + additionalDuration,
          actions_count: (existingSession.actions_count || 0) + 1,
          updated_at: new Date()
        });
    } else {
      // Criar nova sessão
      // Criar um objeto Request simulado com headers vazios
      const mockRequest = {
        headers: {},
        ip: 'system',
        socket: { remoteAddress: 'system' }
      } as Request;
      
      const clientInfo = getClientInfo(mockRequest);
      
      await db('activity_sessions').insert({
        id: uuidv4(),
        session_id: sessionId,
        user_id: userId,
        start_time: new Date(),
        duration_seconds: additionalDuration,
        actions_count: 1,
        ip_address: clientInfo.ip,
        user_agent: clientInfo.userAgent,
        device_info: {
          browser: clientInfo.browser,
          os: clientInfo.os,
          device: clientInfo.device
        },
        is_active: true,
        last_activity: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  } catch (error) {
    console.error('Erro ao atualizar sessão ativa:', error);
  }
}

// Middleware para finalizar sessões inativas
export const sessionCleanupMiddleware = async (): Promise<void> => {
  const INACTIVE_THRESHOLD = 30 * 60 * 1000; // 30 minutos
  
  try {
    const inactiveSessions = await db('activity_sessions')
      .where('is_active', true)
      .where('last_activity', '<', new Date(Date.now() - INACTIVE_THRESHOLD));
    
    for (const session of inactiveSessions) {
      // Calcular duração final
      const duration = Math.round(
        (new Date(session.last_activity).getTime() - new Date(session.start_time).getTime()) / 1000
      );
      
      // Atualizar sessão como inativa
      await db('activity_sessions')
        .where({ id: session.id })
        .update({
          is_active: false,
          end_time: session.last_activity,
          duration_seconds: duration,
          updated_at: new Date()
        });
      
      // Criar log de timeout de sessão
      await createActivityLog({
        user_id: session.user_id,
        session_id: session.session_id,
        activity_type: 'session_timeout',
        action: 'timeout',
        details: {
          total_duration_seconds: duration,
          total_actions: session.actions_count,
          last_activity: session.last_activity
        }
      });
    }
  } catch (error) {
    console.error('Erro ao limpar sessões inativas:', error);
  }
};

// Configurar limpeza periódica de sessões
setInterval(sessionCleanupMiddleware, 5 * 60 * 1000); // A cada 5 minutos

// Middleware para log de erros
export const errorTrackingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientInfo = getClientInfo(req);
  
  // Criar log de erro
  createActivityLog({
    user_id: (req.user as any)?.id || 'anonymous',
    session_id: req.sessionId,
    activity_type: 'error',
    entity_type: 'system',
    action: 'error',
    details: {
      error_name: error.name,
      error_message: error.message,
      error_stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      method: req.method,
      path: req.path,
      query: req.query,
      status_code: res.statusCode || 500
    },
    ip_address: clientInfo.ip,
    user_agent: clientInfo.userAgent,
    browser: clientInfo.browser,
    operating_system: clientInfo.os,
    device_info: clientInfo.device
  });
  
  next(error);
};

export default activityTrackingMiddleware; 
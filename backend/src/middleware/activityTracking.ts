import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database';
import { getClientInfo } from '../utils/clientInfo';
import { UserActivity, ActivityType } from '../types/activity';
import { errorTrackingMiddleware } from './errorTrackingMiddleware';

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
    // Não permitir user_id nulo - se for nulo ou vazio, não registra a atividade
    if (!data.user_id || data.user_id === '' || data.user_id === 'anonymous') {
      console.log('Ignorando log de atividade: user_id é nulo ou vazio');
      return;
    }
    
    const modifiedData = {
      ...data,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
      date_created: new Date(),
      populated: true
    };
    
    await db('user_activity').insert(modifiedData);
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
    user_id: (req.user as any)?.id ? String((req.user as any)?.id) : '',
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
  const userId = (req.user as any)?.id ? String((req.user as any)?.id) : '';
  await updateActiveSession(req.sessionId!, userId, duration);
}

// Função para atualizar sessão ativa
async function updateActiveSession(
  sessionId: string, 
  userId: string, 
  additionalDuration: number
): Promise<void> {
  try {
    // Não registrar sessão se o userId for vazio ou 'anonymous'
    if (!userId || userId === '' || userId === 'anonymous') {
      console.log('Ignorando atualização de sessão: user_id é nulo ou vazio');
      return;
    }
    
    // Criar um objeto Request simulado com headers vazios
    const mockRequest = {
      headers: {},
      ip: 'system',
      socket: { remoteAddress: 'system' }
    } as Request;
    
    const clientInfo = getClientInfo(mockRequest);
    
    // Usar padrão upsert (INSERT ... ON CONFLICT DO UPDATE ...)
    await db.raw(`
      INSERT INTO activity_sessions (
        id, session_id, user_id, start_time, duration_seconds, 
        actions_count, ip_address, user_agent, device_info, 
        is_active, last_activity, created_at, updated_at
      ) 
      VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
      ON CONFLICT (session_id) 
      DO UPDATE SET 
        last_activity = EXCLUDED.last_activity,
        duration_seconds = COALESCE(activity_sessions.duration_seconds, 0) + ?,
        actions_count = COALESCE(activity_sessions.actions_count, 0) + 1,
        updated_at = EXCLUDED.updated_at
    `, [
      uuidv4(), sessionId, userId, new Date(), additionalDuration,
      1, clientInfo.ip, clientInfo.userAgent, JSON.stringify({
        browser: clientInfo.browser,
        os: clientInfo.os,
        device: clientInfo.device
      }),
      true, new Date(), new Date(), new Date(),
      additionalDuration
    ]);
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

export { errorTrackingMiddleware };
export default activityTrackingMiddleware; 
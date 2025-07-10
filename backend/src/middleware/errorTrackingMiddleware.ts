import { Request, Response, NextFunction } from 'express';
import { getClientInfo } from '../utils/clientInfo';
import db from '../config/database';
import { UserActivity } from '../types/activity';

// Função para extrair user_id de várias fontes
function extractUserId(req: Request): string | null {
  try {
    // 1. Primeiro tentar obter do req.user (padrão)
    if ((req.user as any)?.id) {
      return String((req.user as any).id);
    }
    
    // 2. Tentar obter de headers personalizados
    const userIdHeader = req.headers['x-user-id'] as string;
    if (userIdHeader) {
      return userIdHeader;
    }
    
    // 3. Tentar obter dos cookies - user_data
    const userDataCookie = req.cookies?.user_data;
    if (userDataCookie) {
      try {
        const userData = typeof userDataCookie === 'string' 
          ? JSON.parse(decodeURIComponent(userDataCookie))
          : userDataCookie;
        if (userData && userData.id) {
          return String(userData.id);
        }
      } catch (error) {
        console.log('❌ Erro ao parsear cookie user_data:', error);
      }
    }
    
    // 4. Tentar obter de outros cookies comuns
    const sessionCookie = req.cookies?.session_data;
    if (sessionCookie) {
      try {
        const sessionData = typeof sessionCookie === 'string' 
          ? JSON.parse(decodeURIComponent(sessionCookie))
          : sessionCookie;
        if (sessionData && sessionData.user_id) {
          return String(sessionData.user_id);
        }
        if (sessionData && sessionData.userId) {
          return String(sessionData.userId);
        }
      } catch (error) {
        console.log('❌ Erro ao parsear cookie session_data:', error);
      }
    }
    
    // 5. Tentar obter do cookie user
    const userCookie = req.cookies?.user;
    if (userCookie) {
      try {
        const userData = typeof userCookie === 'string' 
          ? JSON.parse(decodeURIComponent(userCookie))
          : userCookie;
        if (userData && userData.id) {
          return String(userData.id);
        }
      } catch (error) {
        console.log('❌ Erro ao parsear cookie user:', error);
      }
    }
    
    // 6. Tentar obter do body da requisição (para casos específicos)
    if (req.body && req.body.user_id) {
      return String(req.body.user_id);
    }
    
    // 7. Tentar obter dos query parameters
    if (req.query && req.query.user_id) {
      return String(req.query.user_id);
    }
    
    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair user_id:', error);
    return null;
  }
}

// Função para criar log de atividade
async function createErrorActivityLog(data: Partial<UserActivity>): Promise<void> {
  try {
    // Não permitir user_id nulo - se for nulo ou vazio, não registra a atividade
    if (!data.user_id || data.user_id === '' || data.user_id === 'anonymous') {
      console.log('Ignorando log de erro: user_id é nulo ou vazio');
      return;
    }
    
    const modifiedData = {
      ...data,
      id: Date.now(),
      created_at: new Date(),
      updated_at: new Date(),
      date_created: new Date(),
      populated: true
    };
    
    await db('user_activity').insert(modifiedData);
  } catch (error) {
    console.error('Erro ao criar log de erro:', error);
  }
}

// Middleware para log de erros
export const errorTrackingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const clientInfo = getClientInfo(req);
  
  // Criar log de erro
  createErrorActivityLog({
    user_id: extractUserId(req) || '',
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

export default errorTrackingMiddleware; 
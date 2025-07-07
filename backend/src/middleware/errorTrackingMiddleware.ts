import { Request, Response, NextFunction } from 'express';
import { getClientInfo } from '../utils/clientInfo';
import db from '../config/database';
import { UserActivity } from '../types/activity';
import { v4 as uuidv4 } from 'uuid';

// Função para criar log de atividade
async function createErrorActivityLog(data: Partial<UserActivity>): Promise<void> {
  try {
    // Converte user_id para null quando for string vazia ou 'anonymous'
    const modifiedData = {
      ...data,
      id: uuidv4(),
      user_id: (!data.user_id || data.user_id === '' || data.user_id === 'anonymous') ? null : data.user_id,
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
    user_id: (req.user as any)?.id ? String((req.user as any)?.id) : '',
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
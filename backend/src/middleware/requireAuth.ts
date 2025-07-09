import { Request, Response, NextFunction, RequestHandler } from 'express';
import { User } from '../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Cache para tokens recentemente validados
const tokenCache = new Map<string, {
  user: User;
  timestamp: number;
}>();

// Configuração do cache
const TOKEN_CACHE_TTL = 60000; // 60 segundos
const CACHE_CLEANUP_INTERVAL = 300000; // 5 minutos

// Limpeza periódica do cache
setInterval(() => {
  const now = Date.now();
  const expiredKeys: string[] = [];
  
  tokenCache.forEach((value, key) => {
    if (now - value.timestamp > TOKEN_CACHE_TTL) {
      expiredKeys.push(key);
    }
  });
  
  expiredKeys.forEach(key => tokenCache.delete(key));
  
  if (expiredKeys.length > 0) {
    console.log(`🧹 [AUTH] Removidos ${expiredKeys.length} tokens expirados do cache`);
  }
}, CACHE_CLEANUP_INTERVAL);

export const requireAuth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  // Garantir que a resposta sempre será JSON
  res.setHeader('Content-Type', 'application/json');

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided or invalid format.' });
  }
  
  const token = authHeader.substring(7);
  
  // Verificar cache primeiro
  if (tokenCache.has(token)) {
    const cachedData = tokenCache.get(token)!;
    const now = Date.now();
    
    // Verificar se o cache ainda é válido
    if (now - cachedData.timestamp <= TOKEN_CACHE_TTL) {
      req.user = cachedData.user;
      return next();
    }
    
    // Se expirou, remover do cache
    tokenCache.delete(token);
  }

  // TEMPORÁRIO: Bypass completo de autenticação
  console.log('⚠️ [AUTH] Bypass completo de autenticação ativado');
  
  // Criar um usuário mock
  const user = new User();
  user.id = 1;
  user.email = 'admin@sabercon.com.br';
  user.fullName = 'Admin Temporário';
  user.isAdmin = true;
  user.isManager = false;
  user.isStudent = false;
  user.isTeacher = false;
  user.enabled = true;
  
  // Armazenar no cache
  tokenCache.set(token, {
    user,
    timestamp: Date.now()
  });
  
  req.user = user;
  next();
};

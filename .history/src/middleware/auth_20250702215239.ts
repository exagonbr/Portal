import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Tipos para autenticação
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
  permissions: string[];
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Simulação de dados de usuários (em produção, viria do banco de dados)
const MOCK_USERS: Record<string, User> = {
  'admin@sabercon.edu.br': {
    id: '1',
    email: 'admin@sabercon.edu.br',
    name: 'Administrador Sistema',
    role: 'SYSTEM_ADMIN',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
      'books.view', 'books.create', 'books.edit', 'books.delete',
      'assignments.view', 'assignments.create', 'assignments.edit', 'assignments.delete',
      'admin.audit', 'admin.system', 'admin.users', 'admin.settings',
      'activity.view', 'activity.track', 'reports.view', 'reports.create'
    ],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  'teacher@sabercon.edu.br': {
    id: '2',
    email: 'teacher@sabercon.edu.br',
    name: 'Professor João Silva',
    role: 'TEACHER',
    permissions: [
      'courses.view', 'courses.create', 'courses.edit',
      'assignments.view', 'assignments.create', 'assignments.edit', 'assignments.delete',
      'books.view', 'students.view', 'grades.view', 'grades.edit',
      'activity.view', 'reports.view'
    ],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  'student@sabercon.edu.br': {
    id: '3',
    email: 'student@sabercon.edu.br',
    name: 'Aluno Maria Santos',
    role: 'STUDENT',
    permissions: [
      'courses.view', 'assignments.view', 'books.view',
      'grades.view', 'activity.view', 'profile.edit'
    ],
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
};

// Simulação de Redis (em produção, usar Redis real)
const MOCK_REDIS: Record<string, any> = {};

// Funções auxiliares para Redis
export const redisSet = async (key: string, value: any, expireInSeconds?: number): Promise<void> => {
  MOCK_REDIS[key] = {
    value: JSON.stringify(value),
    expiresAt: expireInSeconds ? Date.now() + (expireInSeconds * 1000) : null
  };
  console.log(`🔴 [REDIS] SET ${key} (expires in ${expireInSeconds}s)`);
};

export const redisGet = async (key: string): Promise<any> => {
  const item = MOCK_REDIS[key];
  if (!item) return null;
  
  if (item.expiresAt && Date.now() > item.expiresAt) {
    delete MOCK_REDIS[key];
    console.log(`🔴 [REDIS] EXPIRED ${key}`);
    return null;
  }
  
  console.log(`🔴 [REDIS] GET ${key}`);
  return JSON.parse(item.value);
};

export const redisDel = async (key: string): Promise<void> => {
  delete MOCK_REDIS[key];
  console.log(`🔴 [REDIS] DEL ${key}`);
};

// Gerar tokens JWT
export const generateTokens = (user: User): { accessToken: string; refreshToken: string } => {
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    type: 'access' as const
  };

  const refreshPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    type: 'refresh' as const
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

  return { accessToken, refreshToken };
};

// Verificar token JWT
export const verifyToken = (token: string, isRefresh = false): TokenPayload | null => {
  try {
    const secret = isRefresh ? JWT_REFRESH_SECRET : JWT_SECRET;
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('❌ [AUTH] Token inválido:', error);
    return null;
  }
};

// Extrair token da requisição
export const extractToken = (request: NextRequest): string | null => {
  // 1. Tentar Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Tentar cookie
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  // 3. Tentar query parameter (para casos especiais)
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam) {
    return tokenParam;
  }

  return null;
};

// Middleware de autenticação
export const requireAuth = (handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) => {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const token = extractToken(request);

      if (!token) {
        console.log('❌ [AUTH] Token não fornecido');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Token de acesso requerido',
            code: 'TOKEN_REQUIRED'
          },
          { status: 401 }
        );
      }

      // Verificar se o token está na blacklist (Redis)
      const isBlacklisted = await redisGet(`blacklist:${token}`);
      if (isBlacklisted) {
        console.log('❌ [AUTH] Token na blacklist');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Token inválido ou expirado',
            code: 'TOKEN_BLACKLISTED'
          },
          { status: 401 }
        );
      }

      // Verificar token
      const decoded = verifyToken(token);
      if (!decoded) {
        console.log('❌ [AUTH] Token inválido');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Token inválido ou expirado',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      // Buscar usuário (em produção, viria do banco)
      const user = MOCK_USERS[decoded.email];
      if (!user) {
        console.log('❌ [AUTH] Usuário não encontrado:', decoded.email);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Usuário não encontrado',
            code: 'USER_NOT_FOUND'
          },
          { status: 401 }
        );
      }

      if (user.status !== 'ACTIVE') {
        console.log('❌ [AUTH] Usuário inativo:', user.email);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Conta de usuário inativa',
            code: 'USER_INACTIVE'
          },
          { status: 401 }
        );
      }

      // Verificar se a sessão existe no Redis
      const sessionKey = `session:${user.id}:${token.substring(0, 10)}`;
      const sessionData = await redisGet(sessionKey);
      
      if (!sessionData) {
        console.log('❌ [AUTH] Sessão não encontrada no Redis');
        return NextResponse.json(
          { 
            success: false, 
            message: 'Sessão expirada',
            code: 'SESSION_EXPIRED'
          },
          { status: 401 }
        );
      }

      // Atualizar último acesso na sessão
      await redisSet(sessionKey, {
        ...sessionData,
        lastAccess: new Date().toISOString()
      }, 15 * 60); // 15 minutos

      const authSession: AuthSession = {
        user,
        token,
        refreshToken: sessionData.refreshToken,
        expiresAt: new Date(decoded.exp * 1000).toISOString(),
        permissions: user.permissions
      };


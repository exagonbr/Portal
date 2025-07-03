import { NextRequest, NextResponse } from 'next/server';
import jwt, { SignOptions } from 'jsonwebtoken';
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
  institutionId?: string;
  department?: string;
  preferences?: Record<string, any>;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
  permissions: string[];
  sessionId: string;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  sessionId: string;
  institutionId?: string;
  iat: number;
  exp: number;
}

export interface DeviceInfo {
  userAgent: string;
  browser?: string;
  os?: string;
  device?: string;
  isMobile: boolean;
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  createdAt: string;
  lastAccess: string;
  expiresAt: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  isActive: boolean;
  loginCount: number;
}

// Configurações JWT
const JWT_SECRET = 'SaberconPortal2025_SuperSecretKey_ProductionReady_XYZ789';
const JWT_REFRESH_SECRET = ''
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
export const generateTokens = (user: User, sessionId?: string): { accessToken: string; refreshToken: string; sessionId: string } => {
  const generatedSessionId = sessionId || `sess_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    sessionId: generatedSessionId,
    institutionId: user.institutionId,
    type: 'access' as const
  };

  const refreshPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    sessionId: generatedSessionId,
    institutionId: user.institutionId,
    type: 'refresh' as const
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
  const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions);

  return { accessToken, refreshToken, sessionId: generatedSessionId };
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

// Extrair token da requisição com múltiplos métodos
export const extractToken = (request: NextRequest): string | null => {
  // 1. Tentar Authorization header (Bearer Token)
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    console.log('🔑 [AUTH] Token extraído do Authorization header');
    return token;
  }

  // 2. Tentar X-Auth-Token header
  const xAuthToken = request.headers.get('x-auth-token');
  if (xAuthToken) {
    console.log('🔑 [AUTH] Token extraído do X-Auth-Token header');
    return xAuthToken;
  }

  // 3. Tentar cookies (múltiplas variações)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    
    // Tentar cookie 'token'
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      console.log('🔑 [AUTH] Token extraído do cookie "token"');
      return token;
    }
    
    // Tentar cookie 'auth_token'
    const authTokenCookie = cookies.find(c => c.startsWith('auth_token='));
    if (authTokenCookie) {
      const token = authTokenCookie.split('=')[1];
      console.log('🔑 [AUTH] Token extraído do cookie "auth_token"');
      return token;
    }
    
    // Tentar cookie 'authToken'
    const authTokenCamelCookie = cookies.find(c => c.startsWith('authToken='));
    if (authTokenCamelCookie) {
      const token = authTokenCamelCookie.split('=')[1];
      console.log('🔑 [AUTH] Token extraído do cookie "authToken"');
      return token;
    }
  }

  // 4. Tentar query parameter (para casos especiais como downloads)
  const url = new URL(request.url);
  const tokenParam = url.searchParams.get('token');
  if (tokenParam) {
    console.log('🔑 [AUTH] Token extraído do query parameter');
    return tokenParam;
  }

  // 5. Tentar header personalizado (para compatibilidade)
  const customAuthHeader = request.headers.get('x-access-token');
  if (customAuthHeader) {
    console.log('🔑 [AUTH] Token extraído do X-Access-Token header');
    return customAuthHeader;
  }

  console.log('❌ [AUTH] Nenhum token encontrado na requisição');
  return null;
};

// Extrair informações do dispositivo
export const extractDeviceInfo = (request: NextRequest): DeviceInfo => {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  
  // Detectar browser
  let browser = 'Unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  // Detectar OS
  let os = 'Unknown';
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';
  
  // Detectar dispositivo
  let device = 'Desktop';
  if (userAgent.includes('Mobile')) device = 'Mobile';
  else if (userAgent.includes('Tablet')) device = 'Tablet';
  
  const isMobile = device === 'Mobile' || device === 'Tablet';
  
  return {
    userAgent,
    browser,
    os,
    device,
    isMobile
  };
};

// Extrair IP da requisição
export const extractClientIP = (request: NextRequest): string => {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('x-remote-addr');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIP || remoteAddr || '127.0.0.1';
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

      // Verificar se a sessão existe no Redis usando sessionId do token
      const sessionKey = `session:${user.id}:${decoded.sessionId}`;
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
        permissions: user.permissions,
        sessionId: sessionData.sessionId || `sess_${user.id}_${Date.now()}`,
        deviceInfo: sessionData.deviceInfo,
        ipAddress: sessionData.ipAddress
      };

      console.log(`✅ [AUTH] Usuário autenticado: ${user.email} (${user.role})`);
      return await handler(request, authSession);

    } catch (error: any) {
      console.error('❌ [AUTH] Erro no middleware:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro interno de autenticação',
          code: 'AUTH_ERROR'
        },
        { status: 500 }
      );
    }
  };
};

// Middleware de autorização por role
export const requireRole = (allowedRoles: string[]) => {
  return (handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) => {
    return requireAuth(async (request: NextRequest, auth: AuthSession) => {
      if (!allowedRoles.includes(auth.user.role)) {
        console.log(`❌ [AUTH] Role não autorizada: ${auth.user.role} (permitidas: ${allowedRoles.join(', ')})`);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Permissão insuficiente para acessar este recurso',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: allowedRoles,
            current: auth.user.role
          },
          { status: 403 }
        );
      }

      return await handler(request, auth);
    });
  };
};

// Middleware de autorização por permissão
export const requirePermission = (requiredPermissions: string[]) => {
  return (handler: (request: NextRequest, auth: AuthSession) => Promise<NextResponse>) => {
    return requireAuth(async (request: NextRequest, auth: AuthSession) => {
      const hasPermission = requiredPermissions.every(permission => 
        auth.user.permissions.includes(permission)
      );

      if (!hasPermission) {
        console.log(`❌ [AUTH] Permissões insuficientes: ${auth.user.permissions.join(', ')} (requeridas: ${requiredPermissions.join(', ')})`);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Permissões insuficientes para acessar este recurso',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: requiredPermissions,
            current: auth.user.permissions
          },
          { status: 403 }
        );
      }

      return await handler(request, auth);
    });
  };
};

// Função para fazer login
export const authenticateUser = async (
  email: string,
  password: string,
  deviceInfo?: DeviceInfo,
  ipAddress?: string
): Promise<{
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    sessionId: string;
  };
  message?: string;
}> => {
  try {
    // Verificar credenciais (em produção, verificar hash da senha)
    const user = MOCK_USERS[email];
    if (!user || password !== 'password123') {
      return {
        success: false,
        message: 'Credenciais inválidas'
      };
    }

    if (user.status !== 'ACTIVE') {
      return {
        success: false,
        message: 'Conta de usuário inativa'
      };
    }

    // Gerar tokens com sessionId
    const { accessToken, refreshToken, sessionId } = generateTokens(user);

    // Usar informações fornecidas ou padrões
    const finalDeviceInfo: DeviceInfo = deviceInfo || {
      userAgent: 'API Client',
      browser: 'API',
      os: 'Server',
      device: 'Server',
      isMobile: false
    };

    const finalIpAddress = ipAddress || '127.0.0.1';

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken,
      sessionId,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      deviceInfo: finalDeviceInfo,
      ipAddress: finalIpAddress,
      isActive: true,
      loginCount: 1
    };

    // Salvar sessão no Redis com sessionId
    const sessionKey = `session:${user.id}:${sessionId}`;
    await redisSet(sessionKey, sessionData, 15 * 60); // 15 minutos

    // Salvar refresh token no Redis
    const refreshKey = `refresh:${user.id}:${refreshToken.substring(0, 10)}`;
    await redisSet(refreshKey, {
      userId: user.id,
      email: user.email,
      refreshToken,
      createdAt: new Date().toISOString()
    }, 7 * 24 * 60 * 60); // 7 dias

    console.log(`✅ [AUTH] Login realizado: ${user.email}`);

    return {
      success: true,
      data: {
        user: {
          ...user,
          lastLogin: new Date().toISOString()
        },
        accessToken,
        refreshToken,
        sessionId,
        expiresIn: 15 * 60 // 15 minutos em segundos
      }
    };

  } catch (error: any) {
    console.error('❌ [AUTH] Erro no login:', error);
    return {
      success: false,
      message: 'Erro interno no processo de autenticação'
    };
  }
};

// Função para fazer logout
export const logoutUser = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return { success: false, message: 'Token inválido' };
    }

    // Adicionar token à blacklist
    await redisSet(`blacklist:${token}`, true, 15 * 60); // 15 minutos

    // Remover sessão do Redis usando sessionId
    const sessionKey = `session:${decoded.userId}:${decoded.sessionId}`;
    await redisDel(sessionKey);

    console.log(`✅ [AUTH] Logout realizado: ${decoded.email}`);

    return { success: true, message: 'Logout realizado com sucesso' };

  } catch (error: any) {
    console.error('❌ [AUTH] Erro no logout:', error);
    return { success: false, message: 'Erro interno no processo de logout' };
  }
};

// Função para renovar token
export const refreshAccessToken = async (refreshToken: string): Promise<{
  success: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  message?: string;
}> => {
  try {
    const decoded = verifyToken(refreshToken, true);
    if (!decoded || decoded.type !== 'refresh') {
      return { success: false, message: 'Refresh token inválido' };
    }

    // Verificar se o refresh token existe no Redis
    const refreshKey = `refresh:${decoded.userId}:${refreshToken.substring(0, 10)}`;
    const refreshData = await redisGet(refreshKey);
    
    if (!refreshData) {
      return { success: false, message: 'Refresh token expirado' };
    }

    const user = MOCK_USERS[decoded.email];
    if (!user || user.status !== 'ACTIVE') {
      return { success: false, message: 'Usuário não encontrado ou inativo' };
    }

    // Gerar novos tokens com sessionId
    const { accessToken, refreshToken: newRefreshToken, sessionId } = generateTokens(user);

    // Remover refresh token antigo
    await redisDel(refreshKey);

    // Criar dados da sessão completos
    const deviceInfo: DeviceInfo = {
      userAgent: 'API Client',
      browser: 'API',
      os: 'Server',
      device: 'Server',
      isMobile: false
    };

    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
      createdAt: new Date().toISOString(),
      lastAccess: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      deviceInfo,
      ipAddress: '127.0.0.1',
      isActive: true,
      loginCount: 1
    };

    // Salvar nova sessão com sessionId
    const sessionKey = `session:${user.id}:${sessionId}`;
    await redisSet(sessionKey, sessionData, 15 * 60);

    // Salvar novo refresh token
    const newRefreshKey = `refresh:${user.id}:${newRefreshToken.substring(0, 10)}`;
    await redisSet(newRefreshKey, {
      userId: user.id,
      email: user.email,
      refreshToken: newRefreshToken,
      createdAt: new Date().toISOString()
    }, 7 * 24 * 60 * 60);

    console.log(`✅ [AUTH] Token renovado: ${user.email}`);

    return {
      success: true,
      data: {
        user: {
          ...user,
          lastLogin: new Date().toISOString()
        },
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 15 * 60
      }
    };

  } catch (error: any) {
    console.error('❌ [AUTH] Erro ao renovar token:', error);
    return { success: false, message: 'Erro interno ao renovar token' };
  }
};

export { MOCK_USERS };
import { getRedisClient, TTL } from '../config/redis';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: string;
  institutionId?: string;
  permissions?: string[];
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
}

interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  deviceInfo?: string;
}

export class SessionService {
  private static redis = getRedisClient();
  
  // Prefixos para diferentes tipos de dados no Redis
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly USER_SESSIONS_PREFIX = 'user_sessions:';
  private static readonly ACTIVE_USERS_SET = 'active_users';
  private static readonly REFRESH_TOKEN_PREFIX = 'refresh_token:';
  private static readonly BLACKLISTED_TOKENS_SET = 'blacklisted_tokens';

  /**
   * Cria uma nova sessão para o usuário
   */
  static async createSession(
    user: any, 
    clientInfo: ClientInfo,
    remember: boolean = false
  ): Promise<{ sessionId: string; refreshToken: string }> {
    const sessionId = uuidv4();
    const refreshToken = uuidv4();
    const now = Date.now();
    
    const deviceType = this.detectDeviceType(clientInfo.userAgent);
    
    const sessionData: SessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name || user.role?.name,
      institutionId: user.institution_id,
      permissions: user.permissions || user.role?.permissions || [],
      createdAt: now,
      lastActivity: now,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      deviceInfo: clientInfo.deviceInfo,
      deviceType,
    };

    // TTL baseado no "remember me"
    const sessionTTL = remember ? TTL.REFRESH_TOKEN : TTL.SESSION;

    // Armazena dados da sessão
    await this.redis.setex(
      `${this.SESSION_PREFIX}${sessionId}`,
      sessionTTL,
      JSON.stringify(sessionData)
    );

    // Armazena refresh token
    await this.redis.setex(
      `${this.REFRESH_TOKEN_PREFIX}${refreshToken}`,
      TTL.REFRESH_TOKEN,
      sessionId
    );

    // Adiciona sessão à lista do usuário
    await this.redis.sadd(`${this.USER_SESSIONS_PREFIX}${user.id}`, sessionId);
    
    // Adiciona usuário ao conjunto de usuários ativos
    await this.redis.sadd(this.ACTIVE_USERS_SET, user.id);

    // Define TTL para a lista de sessões do usuário
    await this.redis.expire(`${this.USER_SESSIONS_PREFIX}${user.id}`, sessionTTL);

    // Incrementa contador por tipo de device (para estatísticas otimizadas)
    await this.redis.incr(`session_count:${deviceType}`);
    
    // Invalidar cache de estatísticas
    await this.redis.del('session_stats_cache');

    console.log(`✅ Sessão criada para usuário ${user.email}: ${sessionId}`);
    return { sessionId, refreshToken };
  }

  /**
   * Valida e retorna dados da sessão
   */
  static async validateSession(sessionId: string, userId?: any): Promise<SessionData | null> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (!sessionDataStr) {
        return null;
      }

      const sessionData: SessionData = JSON.parse(sessionDataStr);
      
      // Atualiza última atividade
      await this.updateSessionActivity(sessionId);
      
      return sessionData;
    } catch (error) {
      console.log('Erro ao validar sessão:', error);
      return null;
    }
  }

  /**
   * Atualiza a última atividade da sessão
   */
  static async updateSessionActivity(sessionId: string): Promise<void> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = Date.now();
        
        // Recupera TTL atual
        const ttl = await this.redis.ttl(`${this.SESSION_PREFIX}${sessionId}`);
        
        await this.redis.setex(
          `${this.SESSION_PREFIX}${sessionId}`,
          ttl > 0 ? ttl : TTL.SESSION,
          JSON.stringify(sessionData)
        );
      }
    } catch (error) {
      console.log('Erro ao atualizar atividade da sessão:', error);
    }
  }

  /**
   * Destrói uma sessão específica
   */
  static async destroySession(sessionId: string): Promise<boolean> {
    try {
      const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
      
      if (sessionDataStr) {
        const sessionData: SessionData = JSON.parse(sessionDataStr);
        
        // Remove sessão
        await this.redis.del(`${this.SESSION_PREFIX}${sessionId}`);
        
        // Remove sessão da lista do usuário
        await this.redis.srem(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`, sessionId);
        
        // Decrementa contador por tipo de device
        const deviceType = sessionData.deviceType || 'unknown';
        const currentCount = await this.redis.get(`session_count:${deviceType}`);
        if (currentCount && parseInt(currentCount) > 0) {
          await this.redis.decr(`session_count:${deviceType}`);
        }
        
        // Verifica se o usuário tem outras sessões ativas
        const userSessions = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        
        if (userSessions.length === 0) {
          // Remove usuário do conjunto de usuários ativos
          await this.redis.srem(this.ACTIVE_USERS_SET, sessionData.userId);
          // Remove chave de sessões do usuário
          await this.redis.del(`${this.USER_SESSIONS_PREFIX}${sessionData.userId}`);
        }
        
        // Invalidar cache de estatísticas
        await this.redis.del('session_stats_cache');
        
        console.log(`✅ Sessão destruída: ${sessionId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Erro ao destruir sessão:', error);
      return false;
    }
  }

  /**
   * Destrói todas as sessões do usuário
   */
  static async destroyAllUserSessions(userId: string): Promise<number> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      if (sessionIds.length === 0) {
        return 0;
      }

      // Remove todas as sessões
      const sessionKeys = sessionIds.map(id => `${this.SESSION_PREFIX}${id}`);
      await this.redis.del(...sessionKeys);
      
      // Remove lista de sessões do usuário
      await this.redis.del(`${this.USER_SESSIONS_PREFIX}${userId}`);
      
      // Remove usuário do conjunto de usuários ativos
      await this.redis.srem(this.ACTIVE_USERS_SET, userId);
      
      console.log(`✅ ${sessionIds.length} sessões removidas para o usuário ${userId}`);
      return sessionIds.length;
    } catch (error) {
      console.log('Erro ao destruir todas as sessões do usuário:', error);
      return 0;
    }
  }

  /**
   * Obtém todas as sessões de um usuário
   */
  static async getUserSessions(userId: string): Promise<any[]> {
    try {
      const sessionIds = await this.redis.smembers(`${this.USER_SESSIONS_PREFIX}${userId}`);
      const sessions: any[] = [];

      for (const sessionId of sessionIds) {
        const sessionDataStr = await this.redis.get(`${this.SESSION_PREFIX}${sessionId}`);
        
        if (sessionDataStr) {
          const sessionData: SessionData = JSON.parse(sessionDataStr);
          const ttl = await this.redis.ttl(`${this.SESSION_PREFIX}${sessionId}`);
          
          sessions.push({
            sessionId,
            userId: sessionData.userId,
            email: sessionData.email,
            name: sessionData.name,
            createdAt: new Date(sessionData.createdAt),
            lastActivity: new Date(sessionData.lastActivity),
            expiresAt: new Date(Date.now() + (ttl * 1000)),
            ipAddress: sessionData.ipAddress,
            userAgent: sessionData.userAgent,
            deviceInfo: sessionData.deviceInfo,
            deviceType: sessionData.deviceType,
            location: sessionData.location,
            isCurrentSession: false // Será definido na rota
          });
        }
      }

      return sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      console.log('Erro ao obter sessões do usuário:', error);
      return [];
    }
  }

  /**
   * Valida refresh token e retorna sessionId
   */
  static async validateRefreshToken(refreshToken: string): Promise<string | null> {
    try {
      const sessionId = await this.redis.get(`${this.REFRESH_TOKEN_PREFIX}${refreshToken}`);
      return sessionId;
    } catch (error) {
      console.log('Erro ao validar refresh token:', error);
      return null;
    }
  }

  /**
   * Remove refresh token
   */
  static async destroyRefreshToken(refreshToken: string): Promise<void> {
    try {
      await this.redis.del(`${this.REFRESH_TOKEN_PREFIX}${refreshToken}`);
    } catch (error) {
      console.log('Erro ao remover refresh token:', error);
    }
  }

  /**
   * Adiciona token JWT à blacklist
   */
  static async blacklistToken(token: string): Promise<void> {
    try {
      // Decodifica o token para obter a data de expiração
      const decoded = jwt.decode(token) as any;
      const expiresAt = decoded?.exp ? decoded.exp * 1000 : Date.now() + TTL.SESSION * 1000;
      const ttl = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      
      if (ttl > 0) {
        await this.redis.setex(`${this.BLACKLISTED_TOKENS_SET}:${token}`, ttl, '1');
      }
    } catch (error) {
      console.log('Erro ao adicionar token à blacklist:', error);
    }
  }

  /**
   * Verifica se token está na blacklist (com timeout)
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      // Adicionar timeout para evitar bloqueios longos
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 5000); // 5s timeout
      });
      
      const checkPromise = this.redis.get(`${this.BLACKLISTED_TOKENS_SET}:${token}`)
        .then(result => result === '1');
      
      const result = await Promise.race([checkPromise, timeoutPromise]);
      return result;
    } catch (error) {
      console.log('Erro ao verificar blacklist do token:', error);
      return false; // Em caso de erro, assumir que não está na blacklist
    }
  }

  /**
   * Obtém estatísticas de sessões ativas (otimizado com cache)
   */
  static async getSessionStats(): Promise<{
    activeUsers: number;
    totalActiveSessions: number;
    sessionsByDevice: Record<string, number>;
  }> {
    try {
      const cacheKey = 'session_stats_cache';
      const cacheTimeout = 30; // 30 segundos de cache
      
      // Tentar obter do cache primeiro
      const cachedStats = await this.redis.get(cacheKey);
      if (cachedStats) {
        console.log('📊 Retornando estatísticas de sessão do cache');
        return JSON.parse(cachedStats);
      }
      
      console.log('📊 Calculando estatísticas de sessão (cache miss)');
      
      // Usar contadores Redis em vez de keys() para melhor performance
      const activeUsers = await this.redis.scard(this.ACTIVE_USERS_SET);
      
      // Usar contadores por device type em vez de escanear todas as sessões
      const deviceCounters = await Promise.all([
        this.redis.get('session_count:mobile') || '0',
        this.redis.get('session_count:desktop') || '0',
        this.redis.get('session_count:tablet') || '0',
        this.redis.get('session_count:unknown') || '0'
      ]);
      
      const sessionsByDevice = {
        mobile: parseInt(deviceCounters[0] as string) || 0,
        desktop: parseInt(deviceCounters[1] as string) || 0,
        tablet: parseInt(deviceCounters[2] as string) || 0,
        unknown: parseInt(deviceCounters[3] as string) || 0
      };
      
      const totalActiveSessions = Object.values(sessionsByDevice).reduce((sum, count) => sum + count, 0);
      
      const stats = {
        activeUsers,
        totalActiveSessions,
        sessionsByDevice
      };
      
      // Armazenar no cache
      await this.redis.setex(cacheKey, cacheTimeout, JSON.stringify(stats));
      
      console.log('📊 Estatísticas calculadas e armazenadas no cache:', stats);
      return stats;
    } catch (error) {
      console.log('Erro ao obter estatísticas de sessões:', error);
      
      // Fallback com dados básicos
      const fallbackStats = {
        activeUsers: 0,
        totalActiveSessions: 0,
        sessionsByDevice: {
          mobile: 0,
          desktop: 0,
          tablet: 0,
          unknown: 0
        }
      };
      
      return fallbackStats;
    }
  }

  /**
   * Detecta tipo de device baseado no User-Agent
   */
  private static detectDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
    const mobileRegex = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i;
    const tabletRegex = /iPad|Android(?!.*Mobile)/i;
    
    if (tabletRegex.test(userAgent)) {
      return 'tablet';
    }
    if (mobileRegex.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Limpa sessões expiradas (para uso em cron jobs)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      let cleanedCount = 0;
      const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
      
      for (const key of sessionKeys) {
        const ttl = await this.redis.ttl(key);
        if (ttl <= 0) {
          const sessionId = key?.replace(this.SESSION_PREFIX, '') || '';
          await this.destroySession(sessionId);
          cleanedCount++;
        }
      }
      
      console.log(`🧹 ${cleanedCount} sessões expiradas removidas`);
      return cleanedCount;
    } catch (error) {
      console.log('Erro ao limpar sessões expiradas:', error);
      return 0;
    }
  }

  /**
   * Sincroniza contadores de sessão com dados reais (para manutenção)
   */
  static async syncSessionCounters(): Promise<void> {
    try {
      console.log('🔄 Sincronizando contadores de sessão...');
      
      // Reset contadores
      await Promise.all([
        this.redis.set('session_count:mobile', '0'),
        this.redis.set('session_count:desktop', '0'),
        this.redis.set('session_count:tablet', '0'),
        this.redis.set('session_count:unknown', '0')
      ]);
      
      // Contar sessões ativas por device type
      const sessionKeys = await this.redis.keys(`${this.SESSION_PREFIX}*`);
      const deviceCounts: Record<string, number> = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
        unknown: 0
      };
      
      for (const key of sessionKeys) {
        const sessionDataStr = await this.redis.get(key);
        if (sessionDataStr) {
          const sessionData: SessionData = JSON.parse(sessionDataStr);
          const deviceType = sessionData.deviceType || 'unknown';
          deviceCounts[deviceType]++;
        }
      }
      
      // Atualizar contadores
      await Promise.all([
        this.redis.set('session_count:mobile', deviceCounts.mobile.toString()),
        this.redis.set('session_count:desktop', deviceCounts.desktop.toString()),
        this.redis.set('session_count:tablet', deviceCounts.tablet.toString()),
        this.redis.set('session_count:unknown', deviceCounts.unknown.toString())
      ]);
      
      // Invalidar cache
      await this.redis.del('session_stats_cache');
      
      console.log('✅ Contadores sincronizados:', deviceCounts);
    } catch (error) {
      console.log('Erro ao sincronizar contadores:', error);
    }
  }
} 
import Redis from 'ioredis';

// Instância do Redis principal
let redis: Redis | null = null;

// Instância do Redis para filas
let queueRedis: Redis | null = null;

// Instância do Redis para cache de conteúdo estático
let staticCacheRedis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const options: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
      retryDelayOnFailover: 100,
      enableOfflineQueue: true, // Permite enfileiramento offline
      family: 4, // IPv4
      retryConnect: (times: number) => Math.min(times * 50, 2000), // Retry com backoff exponencial
    };

    // Adiciona password apenas se existir
    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
    }

    // Adiciona TLS para produção se necessário
    if (process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true') {
      options.tls = {};
    }

    redis = new Redis(options);

    // Event listeners para monitoramento
    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    redis.on('error', (error) => {
      console.log('❌ Erro na conexão Redis:', error);
    });

    redis.on('close', () => {
      console.log('🔌 Conexão Redis fechada');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis...');
    });
  }

  return redis;
};

export const getQueueRedisClient = (): Redis => {
  if (!queueRedis) {
    const options: any = {
      host: process.env.QUEUE_REDIS_HOST || process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.QUEUE_REDIS_PORT || process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.QUEUE_REDIS_DB || '1'),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      retryConnect: (times: number) => Math.min(times * 50, 2000),
    };

    // Adiciona password apenas se existir
    const password = process.env.QUEUE_REDIS_PASSWORD || process.env.REDIS_PASSWORD;
    if (password) {
      options.password = password;
    }

    queueRedis = new Redis(options);

    // Event listeners para monitoramento
    queueRedis.on('connect', () => {
      console.log('✅ Redis para filas conectado com sucesso');
    });

    queueRedis.on('error', (error) => {
      console.log('❌ Erro na conexão Redis para filas:', error);
    });

    queueRedis.on('close', () => {
      console.log('🔌 Conexão Redis para filas fechada');
    });

    queueRedis.on('reconnecting', () => {
      console.log('🔄 Reconectando ao Redis para filas...');
    });
  }

  return queueRedis;
};

export const getStaticCacheRedisClient = (): Redis => {
  if (!staticCacheRedis) {
    const options: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_STATIC_CACHE_DB || '2'), // DB 2 para cache estático
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
      enableOfflineQueue: true,
      retryConnect: (times: number) => Math.min(times * 50, 2000),
    };

    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
    }

    if (process.env.NODE_ENV === 'production' && process.env.REDIS_TLS === 'true') {
      options.tls = {};
    }

    staticCacheRedis = new Redis(options);

    staticCacheRedis.on('connect', () => {
      console.log('✅ Redis para cache estático conectado com sucesso');
    });

    staticCacheRedis.on('error', (error) => {
      console.log('❌ Erro na conexão Redis para cache estático:', error);
    });
  }

  return staticCacheRedis;
};

// Função para testar a conexão
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    
    // Tenta conectar primeiro se usando lazyConnect
    if (client.status === 'wait') {
      await client.connect();
    }
    
    // Verifica se está conectado
    if (client.status !== 'ready') {
      console.log('❌ Redis não está no estado "ready". Status atual:', client.status);
      return false;
    }
    
    // Testa com ping
    const result = await client.ping();
    if (result === 'PONG') {
      console.log('✅ Teste de conexão Redis bem-sucedido');
      return true;
    } else {
      console.log('❌ Redis ping não retornou PONG:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Falha no teste de conexão Redis:', error);
    return false;
  }
};

// Função para testar a conexão das filas
export const testQueueRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getQueueRedisClient();
    
    if (client.status === 'wait') {
      await client.connect();
    }
    
    if (client.status !== 'ready') {
      console.log('❌ Redis para filas não está no estado "ready". Status atual:', client.status);
      return false;
    }
    
    const result = await client.ping();
    if (result === 'PONG') {
      console.log('✅ Teste de conexão Redis para filas bem-sucedido');
      return true;
    } else {
      console.log('❌ Redis para filas ping não retornou PONG:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Falha no teste de conexão Redis para filas:', error);
    return false;
  }
};

// Função para testar conexão do cache estático
export const testStaticCacheRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getStaticCacheRedisClient();
    
    if (client.status === 'wait') {
      await client.connect();
    }
    
    if (client.status !== 'ready') {
      console.log('❌ Redis para cache estático não está no estado "ready". Status atual:', client.status);
      return false;
    }
    
    const result = await client.ping();
    if (result === 'PONG') {
      console.log('✅ Teste de conexão Redis para cache estático bem-sucedido');
      return true;
    } else {
      console.log('❌ Redis para cache estático ping não retornou PONG:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Falha no teste de conexão Redis para cache estático:', error);
    return false;
  }
};

// Função para fechar as conexões (útil para testes e shutdown)
export const closeRedisConnections = async (): Promise<void> => {
  const promises: Promise<any>[] = [];
  
  if (redis) {
    promises.push(redis.quit());
    redis = null;
  }
  
  if (queueRedis) {
    promises.push(queueRedis.quit());
    queueRedis = null;
  }

  if (staticCacheRedis) {
    promises.push(staticCacheRedis.quit());
    staticCacheRedis = null;
  }
  
  await Promise.all(promises);
  console.log('🔌 Todas as conexões Redis fechadas');
};

// Configurações de TTL (Time To Live) para diferentes tipos de dados
export const TTL = {
  // Sessões e autenticação
  SESSION: 24 * 60 * 60, // 24 horas em segundos
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 dias em segundos
  ACCESS_TOKEN: 60 * 60, // 1 hora em segundos
  BLACKLIST_TOKEN: 24 * 60 * 60, // 24 horas em segundos
  
  // Cache temporário
  TEMP_DATA: 15 * 60, // 15 minutos em segundos
  CACHE: 60 * 60, // 1 hora em segundos
  SHORT_CACHE: 5 * 60, // 5 minutos em segundos
  
  // Dados de usuário
  USER_SESSION: 24 * 60 * 60, // 24 horas em segundos
  USER_PREFERENCES: 7 * 24 * 60 * 60, // 7 dias em segundos
  
  // Conteúdo educacional
  COURSE_DATA: 2 * 60 * 60, // 2 horas em segundos
  BOOK_PROGRESS: 30 * 24 * 60 * 60, // 30 dias em segundos
  VIDEO_PROGRESS: 30 * 24 * 60 * 60, // 30 dias em segundos
  LESSON_CONTENT: 4 * 60 * 60, // 4 horas em segundos
  
  // Cache estático
  STATIC_CONTENT: 24 * 60 * 60, // 24 horas em segundos
  API_RESPONSE: 30 * 60, // 30 minutos em segundos
  SEARCH_RESULTS: 10 * 60, // 10 minutos em segundos
  
  // Sistema e monitoramento
  SYSTEM_STATS: 60, // 1 minuto em segundos
  HEALTH_CHECK: 30, // 30 segundos em segundos
  RATE_LIMIT: 60 * 60, // 1 hora em segundos
} as const;

// Prefixos para organização das chaves Redis
export const REDIS_PREFIXES = {
  // Sessões e autenticação
  SESSION: 'session:',
  USER_SESSIONS: 'user_sessions:',
  REFRESH_TOKEN: 'refresh_token:',
  BLACKLISTED_TOKENS: 'blacklisted_tokens:',
  ACTIVE_USERS: 'active_users',
  
  // Cache de dados
  CACHE: 'cache:',
  STATIC_CACHE: 'static:',
  API_CACHE: 'api:',
  
  // Conteúdo educacional
  COURSE: 'course:',
  BOOK: 'book:',
  LESSON: 'lesson:',
  PROGRESS: 'progress:',
  
  // Sistema
  STATS: 'stats:',
  HEALTH: 'health:',
  RATE_LIMIT: 'rate_limit:',
  
  // Contadores
  COUNTERS: 'counters:',
  SESSION_COUNT: 'session_count:',
} as const;

// Classe para gerenciamento avançado do Redis
export class RedisManager {
  private static instance: RedisManager;
  private redis: Redis;
  private queueRedis: Redis;
  private staticCacheRedis: Redis;

  private constructor() {
    this.redis = getRedisClient();
    this.queueRedis = getQueueRedisClient();
    this.staticCacheRedis = getStaticCacheRedisClient();
  }

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  // Método para limpeza geral do sistema (em caso de loops)
  public async emergencyCleanup(): Promise<{
    sessionsCleared: number;
    tokensCleared: number;
    cacheCleared: number;
    staticCacheCleared: number;
  }> {
    console.log('🚨 INICIANDO LIMPEZA GERAL DE EMERGÊNCIA...');
    
    const results = {
      sessionsCleared: 0,
      tokensCleared: 0,
      cacheCleared: 0,
      staticCacheCleared: 0
    };

    try {
      // 1. Limpar todas as sessões
      const sessionKeys = await this.redis.keys(`${REDIS_PREFIXES.SESSION}*`);
      if (sessionKeys.length > 0) {
        await this.redis.del(...sessionKeys);
        results.sessionsCleared = sessionKeys.length;
      }

      // 2. Limpar sessões de usuários
      const userSessionKeys = await this.redis.keys(`${REDIS_PREFIXES.USER_SESSIONS}*`);
      if (userSessionKeys.length > 0) {
        await this.redis.del(...userSessionKeys);
      }

      // 3. Limpar tokens
      const tokenKeys = await this.redis.keys(`${REDIS_PREFIXES.REFRESH_TOKEN}*`);
      const blacklistKeys = await this.redis.keys(`${REDIS_PREFIXES.BLACKLISTED_TOKENS}*`);
      const allTokenKeys = [...tokenKeys, ...blacklistKeys];
      if (allTokenKeys.length > 0) {
        await this.redis.del(...allTokenKeys);
        results.tokensCleared = allTokenKeys.length;
      }

      // 4. Limpar usuários ativos
      await this.redis.del(REDIS_PREFIXES.ACTIVE_USERS);

      // 5. Limpar cache geral
      const cacheKeys = await this.redis.keys(`${REDIS_PREFIXES.CACHE}*`);
      const apiKeys = await this.redis.keys(`${REDIS_PREFIXES.API_CACHE}*`);
      const allCacheKeys = [...cacheKeys, ...apiKeys];
      if (allCacheKeys.length > 0) {
        await this.redis.del(...allCacheKeys);
        results.cacheCleared = allCacheKeys.length;
      }

      // 6. Limpar cache estático
      const staticKeys = await this.staticCacheRedis.keys(`${REDIS_PREFIXES.STATIC_CACHE}*`);
      if (staticKeys.length > 0) {
        await this.staticCacheRedis.del(...staticKeys);
        results.staticCacheCleared = staticKeys.length;
      }

      // 7. Resetar contadores
      const counterKeys = await this.redis.keys(`${REDIS_PREFIXES.COUNTERS}*`);
      const sessionCountKeys = await this.redis.keys(`${REDIS_PREFIXES.SESSION_COUNT}*`);
      const allCounterKeys = [...counterKeys, ...sessionCountKeys];
      if (allCounterKeys.length > 0) {
        await this.redis.del(...allCounterKeys);
      }

      // 8. Limpar estatísticas
      const statsKeys = await this.redis.keys(`${REDIS_PREFIXES.STATS}*`);
      if (statsKeys.length > 0) {
        await this.redis.del(...statsKeys);
      }

      console.log('✅ LIMPEZA GERAL CONCLUÍDA:', results);
      return results;

    } catch (error) {
      console.error('❌ Erro durante limpeza geral:', error);
      throw error;
    }
  }

  // Método para detectar loops baseado em padrões suspeitos
  public async detectLoop(): Promise<boolean> {
    try {
      // Verificar se há muitas sessões sendo criadas rapidamente
      const sessionCount = await this.redis.dbsize();
      
      // Verificar se há tokens em excesso
      const tokenKeys = await this.redis.keys(`${REDIS_PREFIXES.REFRESH_TOKEN}*`);
      
      // Verificar atividade suspeita (muitas chaves criadas recentemente)
      const recentActivity = await this.redis.get('recent_activity_count') || '0';
      
      const isLoop = sessionCount > 10000 || 
                    tokenKeys.length > 5000 || 
                    parseInt(recentActivity) > 1000;

      if (isLoop) {
        console.log('🔄 LOOP DETECTADO! Iniciando limpeza automática...');
        await this.emergencyCleanup();
      }

      return isLoop;
    } catch (error) {
      console.error('❌ Erro ao detectar loop:', error);
      return false;
    }
  }

  // Método para cache de conteúdo estático
  public async setStaticCache(key: string, value: any, ttl: number = TTL.STATIC_CONTENT): Promise<void> {
    try {
      const cacheKey = `${REDIS_PREFIXES.STATIC_CACHE}${key}`;
      await this.staticCacheRedis.setex(cacheKey, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('❌ Erro ao definir cache estático:', error);
    }
  }

  public async getStaticCache(key: string): Promise<any | null> {
    try {
      const cacheKey = `${REDIS_PREFIXES.STATIC_CACHE}${key}`;
      const value = await this.staticCacheRedis.get(cacheKey);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Erro ao obter cache estático:', error);
      return null;
    }
  }

  // Método para monitoramento de saúde do Redis
  public async healthCheck(): Promise<{
    main: boolean;
    queue: boolean;
    staticCache: boolean;
    memoryUsage: string | null;
  }> {
    const health = {
      main: false,
      queue: false,
      staticCache: false,
      memoryUsage: null as string | null
    };

    try {
      // Testar conexão principal
      await this.redis.ping();
      health.main = true;
    } catch (error) {
      console.error('❌ Redis principal não está saudável:', error);
    }

    try {
      // Testar conexão de filas
      await this.queueRedis.ping();
      health.queue = true;
    } catch (error) {
      console.error('❌ Redis de filas não está saudável:', error);
    }

    try {
      // Testar conexão de cache estático
      await this.staticCacheRedis.ping();
      health.staticCache = true;
    } catch (error) {
      console.error('❌ Redis de cache estático não está saudável:', error);
    }

    try {
      // Obter uso de memória usando INFO
      const memInfo = await this.redis.info('memory');
      health.memoryUsage = memInfo as any;
    } catch (error) {
      console.error('❌ Erro ao obter uso de memória:', error);
    }

    return health;
  }
}

export default getRedisClient;
import Redis, { RedisOptions } from 'ioredis';

// Interface para configuração do Redis
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  tls?: object;
}

// Configuração do Redis
const redisConfig: Record<string, RedisConfig> = {
  // Para desenvolvimento local
  local: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  // Para produção (Redis Cloud, AWS ElastiCache, etc.)
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  }
};

// Instância do Redis
let redis: Redis | null = null;

/**
 * Obtém uma instância singleton do cliente Redis
 * @returns Instância do cliente Redis
 */
export const getRedisClient = (): Redis => {
  if (!redis) {
    const environment = process.env.NODE_ENV === 'production' ? 'production' : 'local';
    const config = redisConfig[environment];

    // Configurações otimizadas do Redis
    const redisOptions: RedisOptions = {
      ...config,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
      // Pool de conexões para melhor performance
      family: 4, // IPv4
      // Configurações de retry
      enableOfflineQueue: false,
    };

    redis = new Redis(redisOptions);

    // Event listeners para monitoramento e debugging
    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    redis.on('ready', () => {
      console.log('🚀 Redis pronto para receber comandos');
    });

    redis.on('error', (error: Error) => {
      console.error('❌ Erro na conexão Redis:', error.message);
      // Em produção, você pode querer enviar isso para um serviço de monitoramento
      if (process.env.NODE_ENV === 'production') {
        // Exemplo: enviar para Sentry, DataDog, etc.
      }
    });

    redis.on('close', () => {
      console.log('🔌 Conexão Redis fechada');
    });

    redis.on('reconnecting', (delay: number) => {
      console.log(`🔄 Reconectando ao Redis em ${delay}ms...`);
    });

    redis.on('end', () => {
      console.log('🔚 Conexão Redis encerrada');
    });
  }

  return redis;
};

/**
 * Testa a conexão com o Redis
 * @returns Promise<boolean> - true se a conexão for bem-sucedida
 */
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    
    if (result === 'PONG') {
      console.log('✅ Teste de conexão Redis bem-sucedido');
      return true;
    }
    
    console.warn('⚠️ Redis respondeu, mas não com PONG:', result);
    return false;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Falha no teste de conexão Redis:', errorMessage);
    return false;
  }
};

/**
 * Fecha a conexão com o Redis de forma segura
 * Útil para testes e shutdown da aplicação
 */
export const closeRedisConnection = async (): Promise<void> => {
  if (redis) {
    try {
      await redis.quit();
      console.log('✅ Conexão Redis fechada com sucesso');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ Erro ao fechar conexão Redis:', errorMessage);
      // Force disconnect se quit falhar
      redis.disconnect();
    } finally {
      redis = null;
    }
  }
};

/**
 * Verifica se o Redis está conectado e pronto
 * @returns boolean - true se conectado
 */
export const isRedisConnected = (): boolean => {
  return redis?.status === 'ready';
};

/**
 * Obtém informações sobre o status da conexão Redis
 * @returns objeto com informações de status
 */
export const getRedisStatus = () => {
  if (!redis) {
    return { connected: false, status: 'not_initialized' };
  }
  
  return {
    connected: redis.status === 'ready',
    status: redis.status,
    options: {
      host: redis.options.host,
      port: redis.options.port,
      db: redis.options.db,
    }
  };
};

// Configurações de TTL (Time To Live) para diferentes tipos de dados
export const TTL = {
  SESSION: 24 * 60 * 60, // 24 horas em segundos
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 dias em segundos
  TEMP_DATA: 15 * 60, // 15 minutos em segundos
  CACHE: 60 * 60, // 1 hora em segundos
  SHORT_CACHE: 5 * 60, // 5 minutos em segundos
  LONG_CACHE: 24 * 60 * 60, // 24 horas em segundos
} as const;

// Prefixos para diferentes tipos de chaves
export const REDIS_PREFIXES = {
  SESSION: 'session:',
  USER: 'user:',
  CACHE: 'cache:',
  TEMP: 'temp:',
  LOCK: 'lock:',
  QUEUE: 'queue:',
} as const;

export default getRedisClient;
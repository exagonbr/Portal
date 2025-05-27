import Redis from 'ioredis';

// Configuração do Redis
const redisConfig = {
  // Para desenvolvimento local
  local: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
  // Para produção (Redis Cloud, AWS ElastiCache, etc.)
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  }
};

// Instância do Redis
let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const config = process.env.NODE_ENV === 'production' 
      ? redisConfig.production 
      : redisConfig.local;

    redis = new Redis({
      ...config,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    // Event listeners para monitoramento
    redis.on('connect', () => {
      console.log('✅ Redis conectado com sucesso');
    });

    redis.on('error', (error) => {
      console.error('❌ Erro na conexão Redis:', error);
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

// Função para testar a conexão
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    console.log('✅ Teste de conexão Redis bem-sucedido');
    return true;
  } catch (error) {
    console.error('❌ Falha no teste de conexão Redis:', error);
    return false;
  }
};

// Função para fechar a conexão (útil para testes e shutdown)
export const closeRedisConnection = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
  }
};

// Configurações de TTL (Time To Live) para diferentes tipos de dados
export const TTL = {
  SESSION: 24 * 60 * 60, // 24 horas em segundos
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 dias em segundos
  TEMP_DATA: 15 * 60, // 15 minutos em segundos
  CACHE: 60 * 60, // 1 hora em segundos
} as const;

export default getRedisClient;
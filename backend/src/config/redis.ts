import Redis from 'ioredis';

// Instância do Redis principal
let redis: Redis | null = null;

// Instância do Redis para filas
let queueRedis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    const options: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
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
      maxRetriesPerRequest: null,
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableReadyCheck: false,
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

// Função para testar a conexão
export const testRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    console.log('✅ Teste de conexão Redis bem-sucedido');
    return true;
  } catch (error) {
    console.log('❌ Falha no teste de conexão Redis:', error);
    return false;
  }
};

// Função para testar a conexão das filas
export const testQueueRedisConnection = async (): Promise<boolean> => {
  try {
    const client = getQueueRedisClient();
    await client.ping();
    console.log('✅ Teste de conexão Redis para filas bem-sucedido');
    return true;
  } catch (error) {
    console.log('❌ Falha no teste de conexão Redis para filas:', error);
    return false;
  }
};

// Função para fechar as conexões (útil para testes e shutdown)
export const closeRedisConnections = async (): Promise<void> => {
  const promises = [];
  
  if (redis) {
    promises.push(redis.quit());
    redis = null;
  }
  
  if (queueRedis) {
    promises.push(queueRedis.quit());
    queueRedis = null;
  }
  
  await Promise.all(promises);
  console.log('🔌 Todas as conexões Redis fechadas');
};

// Configurações de TTL (Time To Live) para diferentes tipos de dados
export const TTL = {
  SESSION: 24 * 60 * 60, // 24 horas em segundos
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 dias em segundos
  TEMP_DATA: 15 * 60, // 15 minutos em segundos
  CACHE: 60 * 60, // 1 hora em segundos
  USER_SESSION: 24 * 60 * 60, // 24 horas em segundos
  COURSE_DATA: 2 * 60 * 60, // 2 horas em segundos
  BOOK_PROGRESS: 30 * 24 * 60 * 60, // 30 dias em segundos
  VIDEO_PROGRESS: 30 * 24 * 60 * 60, // 30 dias em segundos
} as const;

export default getRedisClient;
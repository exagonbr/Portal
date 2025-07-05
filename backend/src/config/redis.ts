import { RedisOptions } from 'ioredis';
import Redis from 'ioredis';

const redisOptions: RedisOptions = {
host: process.env.REDIS_HOST || '127.0.0.1',
port: parseInt(process.env.REDIS_PORT || '6379', 10),
password: process.env.REDIS_PASSWORD || undefined,
db: parseInt(process.env.REDIS_DB || '0', 10),
maxRetriesPerRequest: 3,
connectTimeout: 15000,
lazyConnect: true, // Conecta apenas quando necessário
};

// Cria uma única instância do cliente Redis
const redisClient = new Redis(redisOptions);

redisClient.on('connect', () => {
console.log('✅ Conectado ao Redis com sucesso.');
});

redisClient.on('error', (error: Error) => {
console.error('❌ Erro na conexão com o Redis:', error);
});

redisClient.on('reconnecting', () => {
console.log('🔄 Reconectando ao Redis...');
});

/**
* Testa a conexão com o Redis.
* @returns {Promise<boolean>} True se a conexão for bem-sucedida, false caso contrário.
*/
export const testRedisConnection = async (): Promise<boolean> => {
try {
  await redisClient.connect(); // Força a conexão se estiver em modo lazy
  const pong = await redisClient.ping();
  return pong === 'PONG';
} catch (error) {
  console.error('❌ Falha ao testar a conexão com o Redis:', error);
  return false;
}
};

/**
* Fecha a conexão com o Redis.
*/
export const closeRedisConnection = async (): Promise<void> => {
await redisClient.quit();
console.log('🔌 Conexão com o Redis fechada.');
};

export default redisClient;
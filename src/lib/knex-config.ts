import type { Knex } from 'knex';

// Configuração específica do Knex para Next.js
// Esta configuração evita carregar drivers de banco desnecessários
export const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'root'),
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 1,
    max: 10,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: false
  },
  acquireConnectionTimeout: 30000,
  useNullAsDefault: false,
  // Configurações específicas para PostgreSQL
  searchPath: ['public'],
  // Evitar carregar drivers desnecessários
  asyncStackTraces: false,
  debug: false,
};

// Função para criar conexão Knex de forma segura
export function createKnexConnection(): Knex {
  try {
    const knex = require('knex');
    return knex(knexConfig);
  } catch (error) {
    console.error('Erro ao criar conexão Knex:', error);
    throw error;
  }
}

// Função para testar a conexão
export async function testKnexConnection(connection: Knex): Promise<boolean> {
  try {
    await connection.raw('SELECT 1 as result');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão Knex:', error);
    return false;
  }
} 
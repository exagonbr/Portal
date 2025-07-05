// Wrapper seguro para conexão com banco de dados
// Evita carregar drivers desnecessários como oracledb

import type { Knex } from 'knex';

let knexInstance: Knex | null = null;

// Configuração segura do Knex
const safeKnexConfig = {
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
  },
  acquireConnectionTimeout: 30000,
  useNullAsDefault: false,
};

// Função para obter conexão segura
export async function getSafeConnection(): Promise<Knex> {
  if (knexInstance) {
    return knexInstance;
  }

  try {
    // Importar knex dinamicamente apenas quando necessário
    const knex = await import('knex');
    knexInstance = knex.default(safeKnexConfig);
    return knexInstance;
  } catch (error) {
    console.error('Erro ao criar conexão segura:', error);
    throw new Error('Falha ao conectar com o banco de dados');
  }
}

// Função para testar conexão
export async function testSafeConnection(): Promise<boolean> {
  try {
    const connection = await getSafeConnection();
    await connection.raw('SELECT 1 as result');
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão:', error);
    return false;
  }
}

// Função para fechar conexão
export async function closeSafeConnection(): Promise<void> {
  if (knexInstance) {
    try {
      await knexInstance.destroy();
      knexInstance = null;
    } catch (error) {
      console.error('Erro ao fechar conexão:', error);
    }
  }
} 
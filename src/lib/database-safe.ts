// Este é um módulo seguro para uso tanto no cliente quanto no servidor
// Fornece uma versão segura das funções de banco de dados

import { Knex } from 'knex';

// Interface para configuração de conexão
export interface DatabaseConfig {
  client: string;
  connection: {
    host: string;
    port?: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
  };
  pool?: {
    min?: number;
    max?: number;
    acquireTimeoutMillis?: number;
    createTimeoutMillis?: number;
    destroyTimeoutMillis?: number;
    idleTimeoutMillis?: number;
  };
  migrations?: {
    tableName?: string;
    directory?: string;
  };
  seeds?: {
    directory?: string;
  };
  acquireConnectionTimeout?: number;
  useNullAsDefault?: boolean;
}

// Variável para armazenar a instância do knex
let knexInstance: Knex | null = null;

// Função para obter a conexão com o banco de dados
export const getDatabase = async (): Promise<Knex | null> => {
  if (typeof window !== 'undefined') {
    // Estamos no cliente, retornar null
    console.warn('Tentativa de acessar o banco de dados no cliente');
    return null;
  }

  // Se já temos uma instância, retorná-la
  if (knexInstance) {
    return knexInstance;
  }

  try {
    // Importar knex dinamicamente apenas no servidor
    // Usar require dinâmico para evitar problemas de build
    const knexModule = await import('knex');
    
    // Configuração do banco de dados
    const config: DatabaseConfig = {
      client: process.env.DB_CLIENT || 'pg',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'portal',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
      pool: {
        min: 0,
        max: 10,
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      },
      acquireConnectionTimeout: 30000,
      useNullAsDefault: false,
    };

    // Criar instância do knex com opção para evitar carregar dialetos não utilizados
    const knex = knexModule.default;
    
    // Substituir o método que carrega os dialetos para evitar carregar oracledb
    const originalDialectLoader = knex.Client.prototype._resolveDialect;
    knex.Client.prototype._resolveDialect = function(dialectName: string) {
      if (dialectName === 'oracledb' || dialectName === 'oracle') {
        throw new Error('Oracle dialect is not supported in this environment');
      }
      return originalDialectLoader.call(this, dialectName);
    };
    
    knexInstance = knex(config);
    return knexInstance;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return null;
  }
};

// Função para obter conexão segura (compatibilidade com código existente)
export async function getSafeConnection(): Promise<Knex> {
  const db = await getDatabase();
  if (!db) {
    throw new Error('Não foi possível obter conexão com o banco de dados');
  }
  return db;
}

// Função para executar uma query
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  const db = await getDatabase();
  if (!db) {
    return [];
  }
  
  try {
    return await db.raw(query, params);
  } catch (error) {
    console.error('Erro ao executar query:', error);
    return [];
  }
};

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

// Função para fechar a conexão
export const closeDatabase = async (): Promise<void> => {
  if (knexInstance) {
    await knexInstance.destroy();
    knexInstance = null;
  }
};

// Função para fechar conexão (compatibilidade com código existente)
export async function closeSafeConnection(): Promise<void> {
  return closeDatabase();
}

export default {
  getDatabase,
  getSafeConnection,
  executeQuery,
  testSafeConnection,
  closeDatabase,
  closeSafeConnection
}; 
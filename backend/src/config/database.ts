import knex from 'knex';
import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

// Configuração do banco de dados
const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'postgres',
    password: String(process.env.DB_PASSWORD || 'root'), // Garantir que seja string para evitar erro SASL
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: environment === 'production' ? 5 : 2,
    max: environment === 'production' ? 30 : 10,
    idleTimeoutMillis: environment === 'production' ? 60000 : 30000,
    acquireTimeoutMillis: environment === 'production' ? 120000 : 60000,
    createTimeoutMillis: environment === 'production' ? 30000 : 30000,
    destroyTimeoutMillis: environment === 'production' ? 5000 : 5000,
    reapIntervalMillis: environment === 'production' ? 1000 : 1000,
    createRetryIntervalMillis: 200,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../../migrations',
  },
  seeds: {
    directory: '../../seeds',
  },
  acquireConnectionTimeout: environment === 'production' ? 120000 : 60000,
};

// Instância do Knex
const db: Knex = knex(config);

// Função para testar a conexão com o banco
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await db.raw('SELECT 1 as result');
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Função para fechar a conexão (útil para testes e shutdown)
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await db.destroy();
    console.log('🔌 Conexão com PostgreSQL fechada');
  } catch (error) {
    console.log('❌ Erro ao fechar conexão com PostgreSQL:', error);
  }
};

// Função para executar migrations
export const runMigrations = async (): Promise<void> => {
  try {
    await db.migrate.latest();
    console.log('✅ Migrations executadas com sucesso');
  } catch (error) {
    console.log('❌ Erro ao executar migrations:', error);
    throw error;
  }
};

// Função para executar seeds
export const runSeeds = async (): Promise<void> => {
  try {
    await db.seed.run();
    console.log('✅ Seeds executados com sucesso');
  } catch (error) {
    console.log('❌ Erro ao executar seeds:', error);
    throw error;
  }
};

export default db;
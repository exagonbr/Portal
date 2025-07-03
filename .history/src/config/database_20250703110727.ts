import knex from 'knex';
import type { Knex } from 'knex';

const environment = process.env.NODE_ENV || 'development';

// Configuração do banco de dados
const config: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: '../database/migrations',
  },
  seeds: {
    directory: '../database/seeds',
  },
  acquireConnectionTimeout: 60000,
};

// Instância do Knex
export const connection: Knex = knex(config);

// Função para testar a conexão com o banco
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await connection.raw('SELECT 1 as result');
    console.log('✅ Conexão com MySQL estabelecida com sucesso');
    return true;
  } catch (error) {
    console.log('❌ Erro ao conectar com MySQL:', error);
    return false;
  }
};

// Função para fechar a conexão (útil para testes e shutdown)
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await connection.destroy();
    console.log('🔌 Conexão com MySQL fechada');
  } catch (error) {
    console.log('❌ Erro ao fechar conexão com MySQL:', error);
  }
};

// Função para executar migrations
export const runMigrations = async (): Promise<void> => {
  try {
    await connection.migrate.latest();
    console.log('✅ Migrations executadas com sucesso');
  } catch (error) {
    console.log('❌ Erro ao executar migrations:', error);
    throw error;
  }
};

// Função para executar seeds
export const runSeeds = async (): Promise<void> => {
  try {
    await connection.seed.run();
    console.log('✅ Seeds executados com sucesso');
  } catch (error) {
    console.log('❌ Erro ao executar seeds:', error);
    throw error;
  }
};

export default connection;
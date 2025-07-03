import knexLib from 'knex';
import { knexSnakeCaseMappers } from 'objection';

/**
 * Configuração de conexão com o banco de dados
 */
const config = {
  client: process.env.DB_CLIENT || 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'sabercon',
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  ...knexSnakeCaseMappers()
};

/**
 * Instância do Knex configurada
 */
export const knex = knexLib(config); 
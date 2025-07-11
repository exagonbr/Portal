import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
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
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'portal_sabercon',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || ''), // Garantir que seja string para evitar erro SASL
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'portal_sabercon',
      user: process.env.DB_USER || 'postgres',
      password: String(process.env.DB_PASSWORD || ''), // Garantir que seja string para evitar erro SASL
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    },
    pool: {
      min: 5,
      max: 30,
      acquireTimeoutMillis: 120000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 60000,
      reapIntervalMillis: 1000,
      createTimeoutMillis: 30000,
      createRetryIntervalMillis: 200,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
    acquireConnectionTimeout: 120000,
  },
};

export default config;
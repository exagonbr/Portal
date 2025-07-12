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
      password: process.env.DB_PASSWORD || 'root',
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
      password: "wR*p4,JVbBG?]e#",
      // If you are using a self-signed certificate, you might need to set rejectUnauthorized to false
      // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      // If you are using a self-signed certificate, you might need to set rejectUnauthorized to false
    ssl: true,    
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
      password: "wR*p4,JVbBG?]e#",
      // If you are using a self-signed certificate, you might need to set rejectUnauthorized to false
      // ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      // If you are using a self-signed certificate, you might need to set rejectUnauthorized to false
    ssl: true,    
  },
    pool: {
      min: 2,
      max: 20,
      acquireTimeoutMillis: 60000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    },
    seeds: {
      directory: './seeds',
    },
  },
};

export default config;

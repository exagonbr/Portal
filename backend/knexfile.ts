import type { Knex } from 'knex';
import * as dotenv from 'dotenv';

// Load environment variables from the root .env file
dotenv.config({ path: __dirname + '/../../.env' });

const baseConnection: Knex.MySqlConnectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portal_sabercon',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const baseConfig: Knex.Config = {
  client: 'mysql2',
  connection: baseConnection,
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
};

const config: { [key: string]: Knex.Config } = {
  development: {
    ...baseConfig,
  },

  staging: {
    ...baseConfig,
    connection: {
      ...baseConnection,
      host: process.env.STAGING_DB_HOST || baseConnection.host,
      port: parseInt(process.env.STAGING_DB_PORT || `${baseConnection.port}`),
      user: process.env.STAGING_DB_USER || baseConnection.user,
      password: process.env.STAGING_DB_PASSWORD || baseConnection.password,
      database: process.env.STAGING_DB_NAME || 'portal_sabercon_staging',
    },
  },

  production: {
    ...baseConfig,
    connection: {
      ...baseConnection,
      host: process.env.PROD_DB_HOST || baseConnection.host,
      port: parseInt(process.env.PROD_DB_PORT || `${baseConnection.port}`),
      user: process.env.PROD_DB_USER || baseConnection.user,
      password: process.env.PROD_DB_PASSWORD || baseConnection.password,
      database: process.env.PROD_DB_NAME || 'portal_sabercon_production',
    },
    pool: {
      ...baseConfig.pool,
      min: 2,
      max: 20,
      acquireTimeoutMillis: 60000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
    },
  },
};

export default config;

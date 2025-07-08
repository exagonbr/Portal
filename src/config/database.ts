import { Knex, knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'portal_sabercon',
  },
  migrations: {
    directory: '../database/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: '../database/seeds',
  },
  pool: {
    min: 2,
    max: 10,
  },
};

export const connection = knex(config);
export default config;
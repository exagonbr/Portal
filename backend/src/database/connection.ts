import { Knex, knex } from 'knex';
import config from '../knexfile';

// Use the environment-specific configuration
const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment];

// Create the database connection
export const db = knex(knexConfig);

// Export types for TypeScript
export type Database = typeof db;
export type Transaction = Knex.Transaction;

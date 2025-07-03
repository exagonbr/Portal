import knex from 'knex';
import config from '../knexfile';

const environment = process.env.NODE_ENV || 'development';
const knexConfig = config[environment as keyof typeof config];

if (!knexConfig) {
    throw new Error(`No database configuration found for environment: ${environment}`);
}

export const db = knex(knexConfig);

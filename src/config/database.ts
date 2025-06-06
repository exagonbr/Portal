import knex from 'knex';
import { Model } from 'objection';
import { Institution } from '../models/Institution';
import { Unit } from '../models/Unit';
import { Course } from '../models/Course';
import { Class } from '../models/Class';

const connection = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'portal',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations'
  }
});

Model.knex(connection);

export { connection }; 
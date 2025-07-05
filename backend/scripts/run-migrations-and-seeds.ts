#!/usr/bin/env ts-node

import * as knex from 'knex';
import config from '../knexfile';

async function run() {
  const environment = process.env.NODE_ENV || 'development';
  const knexInstance = knex.default(config[environment]);

  try {
    console.log('Running migrations...');
    await knexInstance.migrate.latest();
    console.log('Migrations completed.');

    console.log('Running seeds...');
    await knexInstance.seed.run();
    console.log('Seeds completed.');

  } catch (error) {
    console.log('Error running migrations and seeds:', error);
  } finally {
    await knexInstance.destroy();
  }
}

run().catch(console.log);

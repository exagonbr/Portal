import knex from 'knex';
import config from '../config/database';

const connection = knex(config);

export default connection; 
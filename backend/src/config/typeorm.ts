import { DataSource } from 'typeorm';
import { Knex } from 'knex';
import knexConfig from '../knexfile';
import { ViewingStatus } from '../entities/ViewingStatus';
import { User } from '../entities/User';
import { Video } from '../entities/Video';
import { TvShow } from '../entities/TVShow';

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] as Knex.Config;

// Garantir que config.connection é um objeto de configuração PostgreSQL
const connection = (typeof config.connection === 'object' ? config.connection : {}) as Knex.PgConnectionConfig;

// Função auxiliar para obter a senha
const getPassword = () => {
  if (typeof connection.password === 'function') {
    const result = connection.password();
    return Promise.resolve(result).then(pwd => String(pwd));
  }
  return Promise.resolve(connection.password || '');
};

// Criar configuração base do DataSource
const createDataSource = async () => {
  const password = await getPassword();
  
  return new DataSource({
    type: 'postgres',
    host: connection.host || 'localhost',
    port: Number(connection.port) || 5432,
    username: connection.user || 'postgres',
    password: password,
    database: connection.database || 'portal_sabercon',
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
    entities: [ViewingStatus, User, Video, TvShow],
    migrations: [],
    subscribers: []
  });
};

// Criar e exportar o DataSource
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: connection.host || 'localhost',
  port: Number(connection.port) || 5432,
  username: connection.user || 'postgres',
  password: connection.password?.toString() || '',
  database: connection.database || 'portal_sabercon',
  synchronize: false,
  logging: process.env.NODE_ENV !== 'production',
  entities: [ViewingStatus, User, Video, TvShow],
  migrations: [],
  subscribers: []
});

// Função para inicializar a conexão com senha assíncrona se necessário
export const initializeDataSource = async () => {
  if (typeof connection.password === 'function') {
    const dataSource = await createDataSource();
    return dataSource.initialize();
  }
  
  return AppDataSource.initialize();
};

// Inicializar a conexão
initializeDataSource()
  .then(() => {
    console.log('TypeORM DataSource inicializado com sucesso');
  })
  .catch((err) => {
    console.error('Erro ao inicializar TypeORM DataSource', err);
  });

export default AppDataSource; 
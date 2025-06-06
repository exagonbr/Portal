import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Institution } from '../entities/Institution';
import { School } from '../entities/School';
import { Class } from '../entities/Class';
import { EducationCycle } from '../entities/EducationCycle';
import { SchoolManager } from '../entities/SchoolManager';
import { UserClass } from '../entities/UserClass';
import { Course } from '../entities/Course';
import { Notification } from '../entities/Notification';
import { Collection } from '../entities/Collection';
import { Module } from '../entities/Module';
import { Video } from '../entities/Video';
import { Book } from '../entities/Book';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';
import { ForumThread } from '../entities/ForumThread';
import { ForumReply } from '../entities/ForumReply';
import { ChatMessage } from '../entities/ChatMessage';
import { Announcement } from '../entities/Announcement';
import { File } from '../entities/File';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'portal_sabercon',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // Disabled to prevent conflicts with Knex migrations
  logging: environment === 'development',
  entities: [
    User,
    Role,
    Institution,
    School,
    Class,
    EducationCycle,
    SchoolManager,
    UserClass,
    Course,
    Notification,
    Collection,
    Module,
    Video,
    Book,
    Quiz,
    Question,
    ForumThread,
    ForumReply,
    ChatMessage,
    Announcement,
    File
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

// Função para inicializar a conexão
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso via TypeORM');
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL via TypeORM:', error);
    throw error;
  }
};

// Função para fechar a conexão
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Conexão com PostgreSQL fechada');
    }
  } catch (error) {
    console.error('❌ Erro ao fechar conexão com PostgreSQL:', error);
    throw error;
  }
};
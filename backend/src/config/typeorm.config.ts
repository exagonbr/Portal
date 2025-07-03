import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Users } from '../entities/Users';
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
import { VideoFile } from '../entities/VideoFile';
import { File } from '../entities/File';
import { Author } from '../entities/Author';
import { ContentAuthor } from '../entities/ContentAuthor';
import { TVShow } from '../entities/TVShow';

// Removed duplicate import of TvShowVideo from '../entities/TvShowVideo'
import { Book } from '../entities/Book';
import { Quiz } from '../entities/Quiz';
import { Question } from '../entities/Question';
import { ForumThread } from '../entities/ForumThread';
import { ForumReply } from '../entities/ForumReply';
import { ChatMessage } from '../entities/ChatMessage';
import { Announcement } from '../entities/Announcement';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoModule } from '../entities/VideoModule';
import {
  TvShowComplete,
  TvShowQuestion,
  TvShowAnswer,
  TvShowFile,
  TvShowVideoFile,
  TvShowAuthor,
  TvShowGenre
} from '../entities/TvShowComplete';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: String(process.env.DB_PASSWORD || 'root'), // Garantir que seja string para evitar erro SASL
  database: process.env.DB_NAME || 'portal_sabercon',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // Disabled to prevent conflicts with Knex migrations
  logging: environment === 'development',
  entities: [
    User,
    Users,
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
    VideoFile,
    File,
    Author,
    ContentAuthor,
    TVShow,
    Book,
    Quiz,
    Question,
    ForumThread,
    ForumReply,
    ChatMessage,
    Announcement,
    VideoCollection,
    VideoModule,
    TvShowComplete,
    TvShowQuestion,
    TvShowAnswer,
    TvShowFile,
    TvShowVideoFile,
    TvShowAuthor,
    TvShowGenre
  ],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
};

export const AppDataSource = new DataSource(dataSourceOptions);

// Função para inicializar a conexão
export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso via TypeORM');
  } catch (error) {
    console.log('❌ Erro ao conectar com PostgreSQL via TypeORM:', error);
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
    console.log('❌ Erro ao fechar conexão com PostgreSQL:', error);
    throw error;
  }
};

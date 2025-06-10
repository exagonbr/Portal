import knex, { Knex } from 'knex';
import { Model } from 'objection';

interface DBConfig {
  client: string
  connection: {
    host: string
    port: number
    database: string
    user: string
    password: string
    ssl?: boolean | { rejectUnauthorized: boolean }
  }
  pool: {
    min: number
    max: number
  }
}

let db: Knex | null = null

const config: DBConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'portal_sabercon',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: 2,
    max: 10,
  },
}

export function getDatabase(): Knex {
  if (!db) {
    db = knex(config);
    Model.knex(db);
  }
  return db;
}

export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.destroy()
    db = null
  }
}

// Interface para tipos de arquivo
export interface FileRecord {
  id: string
  name: string
  original_name: string
  type: string
  size: number
  size_formatted: string
  bucket: string
  s3_key: string
  s3_url: string
  description?: string
  category: 'literario' | 'professor' | 'aluno'
  metadata: Record<string, any>
  checksum?: string
  uploaded_by?: string
  is_active: boolean
  tags: string[]
  created_at: Date
  updated_at: Date
}

// Interface para livros
export interface BookRecord {
  id: string
  title: string
  author?: string
  isbn?: string
  description?: string
  publisher?: string
  publication_year?: number
  language: string
  pages?: number
  category?: string
  cover_url?: string
  file_url?: string
  file_type?: string
  file_size?: number
  institution_id?: string
  status: 'available' | 'unavailable'
  created_at: Date
  updated_at: Date
}

// Interface para buckets/coleções
export interface BucketRecord {
  id: string
  name: string
  description?: string
  type: 'books' | 'videos' | 'documents' | 'mixed'
  created_by: string
  institution_id: string
  is_public: boolean
  items_count: number
  created_at: Date
  updated_at: Date
}

export default getDatabase 
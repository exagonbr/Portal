import knex from '../config/database';
import { v4 as uuidv4 } from 'uuid';

interface LegacyUser {
  id?: string;
  email: string;
  name: string;
  password?: string;
  // outros campos do sistema antigo
}

interface LegacyVideo {
  id?: string;
  name: string;
  description?: string;
  video_url: string;
  duration: number;
  // outros campos do sistema antigo
}

interface LegacyTvShow {
  id?: string;
  title: string;
  synopsis?: string;
  description?: string;
  // outros campos do sistema antigo
}

interface LegacyFile {
  id?: string;
  name: string;
  original_name: string;
  type: string;
  size: number;
  s3_url: string;
  // outros campos do sistema antigo
}

interface LegacyAuthor {
  id?: string;
  name: string;
  email?: string;
  bio?: string;
  // outros campos do sistema antigo
}

export class DataMigrationService {
  private db = knex;

  async migrateUsers(legacyUsers: LegacyUser[]): Promise<void> {
    console.log(`Migrando ${legacyUsers.length} usuários...`);
    
    // Buscar role padrão
    const defaultRole = await this.db('roles').where('name', 'student').first();
    if (!defaultRole) {
      throw new Error('Role padrão "student" não encontrada');
    }

    // Buscar instituição padrão
    const defaultInstitution = await this.db('institutions').first();
    if (!defaultInstitution) {
      throw new Error('Nenhuma instituição encontrada');
    }

    const usersToInsert = legacyUsers.map(user => ({
      id: user.id || uuidv4(),
      email: user.email,
      name: user.name,
      password: user.password || '$2b$12$defaulthash', // hash padrão temporário
      role_id: defaultRole.id,
      institution_id: defaultInstitution.id,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('users').insert(usersToInsert).onConflict('email').ignore();
    console.log('Usuários migrados com sucesso!');
  }

  async migrateVideos(legacyVideos: LegacyVideo[]): Promise<void> {
    console.log(`Migrando ${legacyVideos.length} vídeos...`);
    
    const videosToInsert = legacyVideos.map(video => ({
      id: video.id || uuidv4(),
      name: video.name,
      description: video.description,
      video_url: video.video_url,
      duration: video.duration,
      quality: 'HD',
      format: 'mp4',
      status: 'published',
      is_public: true,
      views_count: 0,
      likes_count: 0,
      rating_average: 0,
      rating_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('videos').insert(videosToInsert).onConflict('id').ignore();
    console.log('Vídeos migrados com sucesso!');
  }

  async migrateTvShows(legacyTvShows: LegacyTvShow[]): Promise<void> {
    console.log(`Migrando ${legacyTvShows.length} séries/coleções...`);
    
    // Buscar instituição padrão
    const defaultInstitution = await this.db('institutions').first();
    if (!defaultInstitution) {
      throw new Error('Nenhuma instituição encontrada');
    }

    const tvShowsToInsert = legacyTvShows.map(tvShow => ({
      id: tvShow.id || uuidv4(),
      title: tvShow.title,
      synopsis: tvShow.synopsis,
      description: tvShow.description,
      institution_id: defaultInstitution.id,
      total_episodes: 0,
      total_seasons: 1,
      total_duration: 0,
      language: 'pt-BR',
      difficulty_level: 'basic',
      status: 'published',
      is_public: true,
      is_premium: false,
      is_featured: false,
      views_count: 0,
      likes_count: 0,
      favorites_count: 0,
      rating_average: 0,
      rating_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('tv_shows').insert(tvShowsToInsert).onConflict('id').ignore();
    console.log('Séries/coleções migradas com sucesso!');
  }

  async migrateFiles(legacyFiles: LegacyFile[]): Promise<void> {
    console.log(`Migrando ${legacyFiles.length} arquivos...`);
    
    const filesToInsert = legacyFiles.map(file => ({
      id: file.id || uuidv4(),
      name: file.name,
      original_name: file.original_name,
      type: file.type,
      size: file.size,
      bucket: 'default-bucket',
      s3_key: file.name,
      s3_url: file.s3_url,
      category: this.determineCategoryFromType(file.type),
      is_active: true,
      tags: [],
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('files').insert(filesToInsert).onConflict('s3_key').ignore();
    console.log('Arquivos migrados com sucesso!');
  }

  async migrateAuthors(legacyAuthors: LegacyAuthor[]): Promise<void> {
    console.log(`Migrando ${legacyAuthors.length} autores...`);
    
    const authorsToInsert = legacyAuthors.map(author => ({
      id: author.id || uuidv4(),
      name: author.name,
      email: author.email,
      bio: author.bio,
      type: 'internal',
      is_active: true,
      social_links: {},
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('authors').insert(authorsToInsert).onConflict('email').ignore();
    console.log('Autores migrados com sucesso!');
  }

  async linkTvShowVideos(tvShowId: string, videoIds: string[]): Promise<void> {
    console.log(`Vinculando ${videoIds.length} vídeos à série ${tvShowId}...`);
    
    const links = videoIds.map((videoId, index) => ({
      id: uuidv4(),
      tv_show_id: tvShowId,
      video_id: videoId,
      season_number: 1,
      episode_number: index + 1,
      order_index: index,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('tv_show_videos').insert(links).onConflict(['tv_show_id', 'season_number', 'episode_number']).ignore();
    
    // Atualizar contadores da série
    await this.db('tv_shows')
      .where('id', tvShowId)
      .update({
        total_episodes: videoIds.length,
        updated_at: new Date()
      });

    console.log('Vídeos vinculados com sucesso!');
  }

  async linkContentAuthors(contentId: string, contentType: string, authorIds: string[]): Promise<void> {
    console.log(`Vinculando ${authorIds.length} autores ao conteúdo ${contentId}...`);
    
    const links = authorIds.map((authorId, index) => ({
      id: uuidv4(),
      author_id: authorId,
      content_id: contentId,
      content_type: contentType,
      role: 'creator',
      order_index: index,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await this.db('content_authors').insert(links).onConflict(['author_id', 'content_id', 'content_type', 'role']).ignore();
    console.log('Autores vinculados com sucesso!');
  }

  private determineCategoryFromType(type: string): string {
    if (type.startsWith('video/')) return 'video';
    if (type.startsWith('image/')) return 'image';
    return 'document';
  }

  async runFullMigration(data: {
    users?: LegacyUser[];
    videos?: LegacyVideo[];
    tvShows?: LegacyTvShow[];
    files?: LegacyFile[];
    authors?: LegacyAuthor[];
  }): Promise<void> {
    console.log('Iniciando migração completa de dados...');
    
    try {
      if (data.users) {
        await this.migrateUsers(data.users);
      }
      
      if (data.authors) {
        await this.migrateAuthors(data.authors);
      }
      
      if (data.files) {
        await this.migrateFiles(data.files);
      }
      
      if (data.videos) {
        await this.migrateVideos(data.videos);
      }
      
      if (data.tvShows) {
        await this.migrateTvShows(data.tvShows);
      }
      
      console.log('Migração completa finalizada com sucesso!');
    } catch (error) {
      console.error('Erro durante a migração:', error);
      throw error;
    }
  }
}

// Exemplo de uso
export async function runMigration() {
  const migrationService = new DataMigrationService();
  
  // Aqui você carregaria os dados do dump
  const data = {
    users: [], // dados do dump
    videos: [], // dados do dump
    tvShows: [], // dados do dump
    files: [], // dados do dump
    authors: [] // dados do dump
  };
  
  await migrationService.runFullMigration(data);
} 
import knex from '../config/database';
import { DumpParser } from './dump-parser';
import { v4 as uuidv4 } from 'uuid';

interface MigrationOptions {
  dumpDirectory: string;
  batchSize?: number;
  dryRun?: boolean;
  defaultInstitutionId?: string;
  createDefaultInstitution?: boolean;
}

export class CompleteDumpMigration {
  private db = knex;
  private parser: DumpParser;
  private batchSize: number;
  private dryRun: boolean;
  private defaultInstitutionId: string = '';

  constructor(options: MigrationOptions) {
    this.batchSize = options.batchSize || 100;
    this.dryRun = options.dryRun || false;
    
    this.parser = new DumpParser({
      dumpDirectory: options.dumpDirectory,
      defaultInstitutionId: options.defaultInstitutionId
    });
  }

  // Utilitário para processar em lotes
  private async processBatch<T>(items: T[], processor: (batch: T[]) => Promise<void>): Promise<void> {
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      await processor(batch);
      console.log(`Processados ${Math.min(i + this.batchSize, items.length)}/${items.length} registros`);
    }
  }

  // 1. Migrar instituições
  async migrateInstitutions(institutions: any[]): Promise<Map<string, string>> {
    console.log(`\n📋 Migrando ${institutions.length} instituições...`);
    
    const idMapping = new Map<string, string>();
    
    if (institutions.length === 0) {
      // Criar instituição padrão se não existir nenhuma
      const defaultInstitution = {
        id: uuidv4(),
        name: 'SABERCON EDUCATIVA',
        code: 'SABERCON',
        type: 'PUBLIC',
        description: 'Instituição migrada do sistema legado',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      if (!this.dryRun) {
        await this.db('institutions').insert(defaultInstitution).onConflict('code').ignore();
      }
      
      this.defaultInstitutionId = defaultInstitution.id;
      console.log(`✅ Instituição padrão criada: ${defaultInstitution.name}`);
      return idMapping;
    }

    await this.processBatch(institutions, async (batch) => {
      batch.forEach(inst => {
        idMapping.set(inst.legacy_id.toString(), inst.id);
      });

      if (!this.dryRun) {
        await this.db('institutions').insert(batch).onConflict('code').ignore();
      }
    });

    // Usar a primeira instituição como padrão
    this.defaultInstitutionId = institutions[0].id;
    console.log(`✅ ${institutions.length} instituições migradas`);
    return idMapping;
  }

  // 2. Migrar usuários
  async migrateUsers(users: any[], institutionMapping: Map<string, string>): Promise<Map<string, string>> {
    console.log(`\n👥 Migrando ${users.length} usuários...`);
    
    const idMapping = new Map<string, string>();
    
    // Buscar role padrão
    const defaultRole = await this.db('roles').where('name', 'student').first();
    if (!defaultRole) {
      throw new Error('Role padrão "student" não encontrada. Execute as migrações primeiro.');
    }

    await this.processBatch(users, async (batch) => {
      const usersToInsert = batch.map(user => {
        idMapping.set(user.legacy_id.toString(), user.id);
        
        return {
          ...user,
          role_id: defaultRole.id,
          institution_id: this.defaultInstitutionId,
          is_active: !user.deleted && user.enabled
        };
      });

      if (!this.dryRun) {
        await this.db('users').insert(usersToInsert).onConflict('email').ignore();
      }
    });

    console.log(`✅ ${users.length} usuários migrados`);
    return idMapping;
  }

  // 3. Migrar autores
  async migrateAuthors(authors: any[]): Promise<Map<string, string>> {
    console.log(`\n✍️ Migrando ${authors.length} autores...`);
    
    const idMapping = new Map<string, string>();
    
    await this.processBatch(authors, async (batch) => {
      batch.forEach(author => {
        idMapping.set(author.legacy_id.toString(), author.id);
      });

      if (!this.dryRun) {
        await this.db('authors').insert(batch).onConflict('email').ignore();
      }
    });

    console.log(`✅ ${authors.length} autores migrados`);
    return idMapping;
  }

  // 4. Migrar arquivos
  async migrateFiles(files: any[]): Promise<Map<string, string>> {
    console.log(`\n📁 Migrando ${files.length} arquivos...`);
    
    const idMapping = new Map<string, string>();
    
    await this.processBatch(files, async (batch) => {
      batch.forEach(file => {
        idMapping.set(file.legacy_id.toString(), file.id);
      });

      if (!this.dryRun) {
        await this.db('files').insert(batch).onConflict('s3_key').ignore();
      }
    });

    console.log(`✅ ${files.length} arquivos migrados`);
    return idMapping;
  }

  // 5. Migrar vídeos
  async migrateVideos(videos: any[], userMapping: Map<string, string>): Promise<Map<string, string>> {
    console.log(`\n🎬 Migrando ${videos.length} vídeos...`);
    
    const idMapping = new Map<string, string>();
    
    await this.processBatch(videos, async (batch) => {
      const videosToInsert = batch.map(video => {
        idMapping.set(video.legacy_id.toString(), video.id);
        
        return {
          ...video,
          // Mapear criador se existir
          created_by: video.created_by ? userMapping.get(video.created_by.toString()) : null
        };
      });

      if (!this.dryRun) {
        await this.db('videos').insert(videosToInsert).onConflict('id').ignore();
      }
    });

    console.log(`✅ ${videos.length} vídeos migrados`);
    return idMapping;
  }

  // 6. Migrar TV Shows
  async migrateTvShows(tvShows: any[], userMapping: Map<string, string>): Promise<Map<string, string>> {
    console.log(`\n📺 Migrando ${tvShows.length} séries/coleções...`);
    
    const idMapping = new Map<string, string>();
    
    await this.processBatch(tvShows, async (batch) => {
      const tvShowsToInsert = batch.map(tvShow => {
        idMapping.set(tvShow.legacy_id.toString(), tvShow.id);
        
        return {
          ...tvShow,
          institution_id: this.defaultInstitutionId,
          created_by: tvShow.created_by ? userMapping.get(tvShow.created_by.toString()) : null
        };
      });

      if (!this.dryRun) {
        await this.db('tv_shows').insert(tvShowsToInsert).onConflict('id').ignore();
      }
    });

    console.log(`✅ ${tvShows.length} séries migradas`);
    return idMapping;
  }

  // 7. Migrar relacionamentos entre arquivos e vídeos
  async migrateVideoFiles(
    videoFiles: any[], 
    videoMapping: Map<string, string>, 
    fileMapping: Map<string, string>
  ): Promise<void> {
    console.log(`\n🔗 Migrando ${videoFiles.length} relacionamentos vídeo-arquivo...`);
    
    await this.processBatch(videoFiles, async (batch) => {
      const videoFilesToInsert = batch
        .filter(vf => videoMapping.has(vf.video_id?.toString()) && fileMapping.has(vf.file_id?.toString()))
        .map(vf => ({
          id: uuidv4(),
          video_id: videoMapping.get(vf.video_id.toString()),
          file_id: fileMapping.get(vf.file_id.toString()),
          file_type: 'video', // assumindo que são arquivos de vídeo
          quality: vf.quality || 'HD',
          language: vf.language || 'pt-BR',
          order_index: vf.order_index || 0,
          created_at: new Date(),
          updated_at: new Date()
        }));

      if (videoFilesToInsert.length > 0 && !this.dryRun) {
        await this.db('video_files').insert(videoFilesToInsert);
      }
    });

    console.log(`✅ ${videoFiles.length} relacionamentos vídeo-arquivo migrados`);
  }

  // 8. Migrar relacionamentos de autores
  async migrateContentAuthors(
    tvShowAuthors: any[],
    videoAuthors: any[],
    tvShowMapping: Map<string, string>,
    videoMapping: Map<string, string>,
    authorMapping: Map<string, string>
  ): Promise<void> {
    console.log(`\n✍️ Migrando relacionamentos de autores...`);
    
    // Migrar autores de TV Shows
    if (tvShowAuthors.length > 0) {
      await this.processBatch(tvShowAuthors, async (batch) => {
        const contentAuthorsToInsert = batch
          .filter(ta => tvShowMapping.has(ta.tv_show_id?.toString()) && authorMapping.has(ta.author_id?.toString()))
          .map(ta => ({
            id: uuidv4(),
            author_id: authorMapping.get(ta.author_id.toString()),
            content_id: tvShowMapping.get(ta.tv_show_id.toString()),
            content_type: 'tv_show',
            role: 'creator',
            order_index: 0,
            created_at: new Date(),
            updated_at: new Date()
          }));

        if (contentAuthorsToInsert.length > 0 && !this.dryRun) {
          await this.db('content_authors').insert(contentAuthorsToInsert);
        }
      });
    }

    // Migrar autores de Vídeos
    if (videoAuthors.length > 0) {
      await this.processBatch(videoAuthors, async (batch) => {
        const contentAuthorsToInsert = batch
          .filter(va => videoMapping.has(va.video_id?.toString()) && authorMapping.has(va.author_id?.toString()))
          .map(va => ({
            id: uuidv4(),
            author_id: authorMapping.get(va.author_id.toString()),
            content_id: videoMapping.get(va.video_id.toString()),
            content_type: 'video',
            role: 'creator',
            order_index: 0,
            created_at: new Date(),
            updated_at: new Date()
          }));

        if (contentAuthorsToInsert.length > 0 && !this.dryRun) {
          await this.db('content_authors').insert(contentAuthorsToInsert);
        }
      });
    }

    console.log(`✅ Relacionamentos de autores migrados`);
  }

  // 9. Atualizar estatísticas e contadores
  async updateStatistics(
    tvShowMapping: Map<string, string>,
    videoMapping: Map<string, string>
  ): Promise<void> {
    console.log(`\n📊 Atualizando estatísticas...`);
    
    if (!this.dryRun) {
      // Atualizar contadores de episódios nas TV Shows
      for (const [legacyTvShowId, newTvShowId] of tvShowMapping) {
        const episodeCount = await this.db('tv_show_videos')
          .where('tv_show_id', newTvShowId)
          .count('* as count')
          .first();

        await this.db('tv_shows')
          .where('id', newTvShowId)
          .update({
            total_episodes: episodeCount?.count || 0,
            updated_at: new Date()
          });
      }

      // Atualizar duração total dos vídeos baseado nos arquivos
      const videosWithFiles = await this.db('videos as v')
        .leftJoin('video_files as vf', 'v.id', 'vf.video_id')
        .leftJoin('files as f', 'vf.file_id', 'f.id')
        .select('v.id', 'f.size', 'f.metadata')
        .whereNotNull('f.id');

      // Aqui você poderia calcular durações baseado nos metadados dos arquivos
    }

    console.log(`✅ Estatísticas atualizadas`);
  }

  // Método principal de migração
  async runFullMigration(options: MigrationOptions): Promise<void> {
    console.log('🚀 Iniciando migração completa do dump...\n');
    
    try {
      // Parse de todos os dados
      const parsedData = await this.parser.parseAll();
      
      if (this.dryRun) {
        console.log('\n🔍 MODO DRY RUN - Nenhum dado será inserido no banco\n');
      }

      // 1. Migrar instituições
      const institutionMapping = await this.migrateInstitutions(parsedData.institutions);

      // 2. Migrar usuários
      const userMapping = await this.migrateUsers(parsedData.users, institutionMapping);

      // 3. Migrar autores
      const authorMapping = await this.migrateAuthors(parsedData.authors);

      // 4. Migrar arquivos
      const fileMapping = await this.migrateFiles(parsedData.files);

      // 5. Migrar vídeos
      const videoMapping = await this.migrateVideos(parsedData.videos, userMapping);

      // 6. Migrar TV Shows
      const tvShowMapping = await this.migrateTvShows(parsedData.tvShows, userMapping);

      // 7. Migrar relacionamentos vídeo-arquivo
      await this.migrateVideoFiles(
        parsedData.relationships.videoFiles,
        videoMapping,
        fileMapping
      );

      // 8. Migrar relacionamentos de autores
      await this.migrateContentAuthors(
        parsedData.relationships.tvShowAuthors,
        parsedData.relationships.videoAuthors,
        tvShowMapping,
        videoMapping,
        authorMapping
      );

      // 9. Atualizar estatísticas
      await this.updateStatistics(tvShowMapping, videoMapping);

      console.log('\n🎉 Migração completa finalizada com sucesso!');
      
      // Relatório final
      console.log(`\n📋 RELATÓRIO FINAL:
        - Instituições: ${parsedData.institutions.length}
        - Usuários: ${parsedData.users.length}
        - Autores: ${parsedData.authors.length}
        - Arquivos: ${parsedData.files.length}
        - Vídeos: ${parsedData.videos.length}
        - TV Shows: ${parsedData.tvShows.length}
        - Relacionamentos: ${Object.values(parsedData.relationships).reduce((a, b) => a + b.length, 0)}
      `);

    } catch (error) {
      console.error('❌ Erro durante a migração:', error);
      throw error;
    }
  }
}

// Script executável
export async function runDumpMigration() {
  const migration = new CompleteDumpMigration({
    dumpDirectory: 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601',
    batchSize: 50,
    dryRun: false, // mude para true para testar sem inserir dados
    createDefaultInstitution: true
  });

  await migration.runFullMigration({
    dumpDirectory: 'C:/Users/estev/OneDrive/Documentos/dumps/Dump20250601'
  });
}

// Executar se chamado diretamente
if (require.main === module) {
  runDumpMigration().catch(console.error);
} 
import * as mysql from 'mysql2/promise';
import { AppDataSource } from '../config/typeorm.config';
import { VideoCollection } from '../entities/VideoCollection';
import { Repository, Not, IsNull } from 'typeorm';

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'sabercon.cifrllkocsxl.sa-east-1.rds.amazonaws.com',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'sabercon',
  password: process.env.MYSQL_PASSWORD || 'gWg28m8^vffI9X#',
  database: process.env.MYSQL_DATABASE || 'sabercon'
};

interface MySQLTVShow {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date?: Date;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  producer?: string;
  total_load?: string;
  manual_support_path?: string;
  contract_term_end?: Date;
  date_created: Date;
  last_updated: Date;
  deleted?: boolean;
}

export class MigrationService {
  private videoCollectionRepository: Repository<VideoCollection>;

  constructor() {
    this.videoCollectionRepository = AppDataSource.getRepository(VideoCollection);
  }

  private static async getMySQLConnection() {
    return await mysql.createConnection(mysqlConfig);
  }

  /**
   * Migra todos os TV Shows do MySQL para PostgreSQL
   */
  async migrateTVShowsToCollections(): Promise<{
    migrated: number;
    skipped: number;
    errors: string[];
  }> {
    const connection = await MigrationService.getMySQLConnection();
    const errors: string[] = [];
    let migrated = 0;
    let skipped = 0;

    try {
      console.log('🚀 Iniciando migração de TV Shows...');

      // Buscar todos os TV Shows do MySQL
      const [rows] = await connection.execute(`
        SELECT 
          id,
          name,
          overview,
          poster_path,
          backdrop_path,
          first_air_date,
          popularity,
          vote_average,
          vote_count,
          producer,
          total_load,
          manual_support_path,
          contract_term_end,
          date_created,
          last_updated,
          deleted
        FROM tv_show 
        ORDER BY id ASC
      `);

      const tvShows = rows as MySQLTVShow[];
      console.log(`📊 Encontrados ${tvShows.length} TV Shows para migrar`);

      for (const tvShow of tvShows) {
        try {
          // Verificar se já foi migrado
          const existing = await this.videoCollectionRepository.findOne({
            where: { mysql_id: tvShow.id }
          });

          if (existing) {
            console.log(`⏭️  TV Show ${tvShow.id} (${tvShow.name}) já migrado, pulando...`);
            skipped++;
            continue;
          }

          // Criar nova coleção
          const collection = new VideoCollection();
          collection.mysql_id = tvShow.id;
          collection.name = tvShow.name;
          collection.synopsis = tvShow.overview || '';
          collection.producer = tvShow.producer || '';
          collection.release_date = tvShow.first_air_date || undefined;
          collection.contract_expiry_date = tvShow.contract_term_end || undefined;
          collection.authors = []; // Será preenchido manualmente depois
          collection.target_audience = []; // Será preenchido manualmente depois
          collection.total_hours = this.convertTotalLoad(tvShow.total_load);
          collection.poster_image_url = tvShow.poster_path || undefined;
          collection.carousel_image_url = tvShow.backdrop_path || undefined;
          collection.ebook_file_url = tvShow.manual_support_path || undefined;
          collection.use_default_cover_for_videos = true;
          collection.popularity = tvShow.popularity || 0;
          collection.vote_average = tvShow.vote_average || 0;
          collection.vote_count = tvShow.vote_count || 0;
          
          // Campos legados
          collection.poster_path = tvShow.poster_path;
          collection.backdrop_path = tvShow.backdrop_path;
          collection.total_load = tvShow.total_load;
          collection.manual_support_path = tvShow.manual_support_path;
          collection.deleted = tvShow.deleted || false;

          await this.videoCollectionRepository.save(collection);

          console.log(`✅ Migrado: ${tvShow.id} -> ${collection.id} (${tvShow.name})`);
          migrated++;

        } catch (error) {
          const errorMsg = `Erro ao migrar TV Show ${tvShow.id} (${tvShow.name}): ${error}`;
          console.error(`❌ ${errorMsg}`);
          errors.push(errorMsg);
        }
      }

    } catch (error) {
      const errorMsg = `Erro geral na migração: ${error}`;
      console.error(`💥 ${errorMsg}`);
      errors.push(errorMsg);
    } finally {
      await connection.end();
    }

    console.log(`🎉 Migração concluída: ${migrated} migrados, ${skipped} pulados, ${errors.length} erros`);

    return {
      migrated,
      skipped,
      errors
    };
  }

  /**
   * Converte o campo total_load para formato HH:MM:SS
   */
  private convertTotalLoad(totalLoad?: string): string {
    if (!totalLoad) return '00:00:00';
    
    // Se já está no formato correto
    if (/^\d{2}:\d{2}:\d{2}$/.test(totalLoad)) {
      return totalLoad;
    }
    
    // Se está em minutos
    if (/^\d+$/.test(totalLoad)) {
      const minutes = parseInt(totalLoad);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:00`;
    }
    
    // Se está em formato "X horas Y minutos"
    const hoursMatch = totalLoad.match(/(\d+)\s*h/i);
    const minutesMatch = totalLoad.match(/(\d+)\s*m/i);
    
    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }

  /**
   * Reverte a migração (remove coleções migradas)
   */
  async revertMigration(): Promise<number> {
    const collections = await this.videoCollectionRepository.find({
      where: { mysql_id: Not(IsNull()) }
    });

    for (const collection of collections) {
      await this.videoCollectionRepository.remove(collection);
    }

    console.log(`🔄 Revertidas ${collections.length} coleções migradas`);
    return collections.length;
  }

  /**
   * Estatísticas da migração
   */
  async getMigrationStats(): Promise<{
    totalMySQLRecords: number;
    totalMigratedRecords: number;
    pendingMigration: number;
  }> {
    const connection = await MigrationService.getMySQLConnection();
    
    try {
      // Contar registros no MySQL
      const [mysqlRows] = await connection.execute('SELECT COUNT(*) as count FROM tv_show');
      const totalMySQLRecords = (mysqlRows as any)[0].count;

      // Contar registros migrados no PostgreSQL
      const totalMigratedRecords = await this.videoCollectionRepository.count({
        where: { mysql_id: Not(IsNull()) }
      });

      const pendingMigration = totalMySQLRecords - totalMigratedRecords;

      return {
        totalMySQLRecords,
        totalMigratedRecords,
        pendingMigration
      };

    } finally {
      await connection.end();
    }
  }
} 
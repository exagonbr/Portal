import { AppDataSource } from '../config/typeorm.config';
import { TvShow } from '../entities/TvShow';
import { VideoCollection } from '../entities/VideoCollection';
import { Repository, Not, IsNull } from 'typeorm';

interface MigrationStats {
  totalMySQLRecords: number;
  totalMigratedRecords: number;
  pendingMigration: number;
}

interface MigrationResult {
  migrated: number;
  skipped: number;
  errors: string[];
}

export class MigrationService {
  private tvShowRepository: Repository<TvShow>;
  private videoCollectionRepository: Repository<VideoCollection>;

  constructor() {
    this.tvShowRepository = AppDataSource.getRepository(TvShow);
    this.videoCollectionRepository = AppDataSource.getRepository(VideoCollection);
  }

  /**
   * Obtém estatísticas sobre o progresso da migração
   */
  async getMigrationStats(): Promise<MigrationStats> {
    // Total de registros na tabela tv_show (MySQL)
    const totalMySQLRecords = await this.tvShowRepository.count({
      where: { deleted: false }
    });

    // Total de registros já migrados para video_collections
    const totalMigratedRecords = await this.videoCollectionRepository.count({
      where: { mysql_id: Not(IsNull()) }
    });

    return {
      totalMySQLRecords,
      totalMigratedRecords,
      pendingMigration: totalMySQLRecords - totalMigratedRecords
    };
  }

  /**
   * Migra dados da tabela tv_show para video_collections
   */
  async migrateTVShowsToCollections(): Promise<MigrationResult> {
    const result: MigrationResult = {
      migrated: 0,
      skipped: 0,
      errors: []
    };

    try {
      // Buscar todos os TVShows não deletados que ainda não foram migrados
      const tvShows = await this.tvShowRepository.find({
        where: { deleted: false }
      });

      console.log(`Encontrados ${tvShows.length} TVShows para migração`);

      for (const tvShow of tvShows) {
        try {
          // Verificar se já existe uma coleção com este mysql_id
          const existingCollection = await this.videoCollectionRepository.findOne({
            where: { mysql_id: tvShow.id }
          });

          if (existingCollection) {
            console.log(`TVShow ${tvShow.id} - ${tvShow.name} já foi migrado, pulando...`);
            result.skipped++;
            continue;
          }

          // Criar nova coleção baseada no TVShow
          const newCollection = this.videoCollectionRepository.create({
            mysql_id: tvShow.id,
            name: tvShow.name,
            synopsis: tvShow.overview,
            producer: tvShow.producer,
            release_date: tvShow.firstAirDate,
            contract_expiry_date: tvShow.contractTermEnd,
            authors: [], // Será preenchido posteriormente se necessário
            target_audience: [], // Será preenchido posteriormente se necessário
            popularity: tvShow.popularity,
            vote_average: tvShow.voteAverage,
            vote_count: tvShow.voteCount,
            
            // Campos legados
            poster_path: tvShow.posterPath,
            backdrop_path: tvShow.backdropPath,
            total_load: tvShow.totalLoad,
            manual_support_path: tvShow.manualSupportPath,
            
            deleted: false,
            created_at: tvShow.dateCreated,
            updated_at: tvShow.lastUpdated
          });

          // Salvar a nova coleção
          await this.videoCollectionRepository.save(newCollection);
          console.log(`✅ TVShow ${tvShow.id} - ${tvShow.name} migrado com sucesso para ID ${newCollection.id}`);
          result.migrated++;
        } catch (error: any) {
          const errorMessage = `Erro ao migrar TVShow ${tvShow.id} - ${tvShow.name}: ${error.message}`;
          console.error(errorMessage);
          result.errors.push(errorMessage);
        }
      }

      return result;
    } catch (error: any) {
      console.error('Erro durante a migração:', error);
      result.errors.push(`Erro geral: ${error.message}`);
      return result;
    }
  }
}
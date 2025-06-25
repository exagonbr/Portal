import { AppDataSource } from '../config/typeorm.config';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoModule } from '../entities/VideoModule';
import { Repository, Like, Not, IsNull } from 'typeorm';

export interface CollectionListItem {
  id: string;
  name: string;
  producer: string;
  total_hours: string;
  video_count: number;
  created_at: Date;
  poster_image_url?: string;
}

export interface CollectionWithVideos extends VideoCollection {
  videos: VideoModule[];
}

export class VideoCollectionService {
  private videoCollectionRepository: Repository<VideoCollection>;
  private videoModuleRepository: Repository<VideoModule>;

  constructor() {
    this.videoCollectionRepository = AppDataSource.getRepository(VideoCollection);
    this.videoModuleRepository = AppDataSource.getRepository(VideoModule);
  }

  /**
   * Lista todas as coleções para gerenciamento
   */
  async getAllCollectionsForManagement(): Promise<CollectionListItem[]> {
    const collections = await this.videoCollectionRepository
      .createQueryBuilder('collection')
      .leftJoin('collection.videos', 'video')
      .select([
        'collection.id',
        'collection.name',
        'collection.producer',
        'collection.total_hours',
        'collection.poster_image_url',
        'collection.created_at'
      ])
      .addSelect('COUNT(video.id)', 'video_count')
      .where('collection.deleted = :deleted', { deleted: false })
      .groupBy('collection.id')
      .orderBy('collection.created_at', 'DESC')
      .getRawMany();

    return collections.map(item => ({
      id: item.collection_id,
      name: item.collection_name,
      producer: item.collection_producer || '',
      total_hours: item.collection_total_hours || '00:00:00',
      video_count: parseInt(item.video_count) || 0,
      created_at: item.collection_created_at,
      poster_image_url: item.collection_poster_image_url
    }));
  }

  /**
   * Busca uma coleção específica com seus vídeos
   */
  async getCollectionWithVideos(id: string): Promise<CollectionWithVideos | null> {
    return await this.videoCollectionRepository.findOne({
      where: { id, deleted: false },
      relations: ['videos'],
      order: {
        videos: {
          module_number: 'ASC',
          order_in_module: 'ASC'
        }
      }
    }) as CollectionWithVideos | null;
  }

  /**
   * Cria uma nova coleção
   */
  async createCollection(data: Partial<VideoCollection>): Promise<VideoCollection> {
    const collection = this.videoCollectionRepository.create({
      ...data,
      deleted: false
    });

    return await this.videoCollectionRepository.save(collection);
  }

  /**
   * Atualiza uma coleção existente
   */
  async updateCollection(id: string, data: Partial<VideoCollection>): Promise<VideoCollection | null> {
    const collection = await this.videoCollectionRepository.findOne({
      where: { id, deleted: false }
    });

    if (!collection) {
      return null;
    }

    Object.assign(collection, data);
    return await this.videoCollectionRepository.save(collection);
  }

  /**
   * Remove uma coleção (soft delete)
   */
  async deleteCollection(id: string): Promise<boolean> {
    const result = await this.videoCollectionRepository.update(
      { id, deleted: false },
      { deleted: true }
    );

    return (result.affected ?? 0) > 0;
  }

  /**
   * Cria um novo vídeo em uma coleção
   */
  async createVideo(data: Partial<VideoModule>): Promise<VideoModule> {
    const video = this.videoModuleRepository.create(data);
    return await this.videoModuleRepository.save(video);
  }

  /**
   * Atualiza um vídeo existente
   */
  async updateVideo(id: string, data: Partial<VideoModule>): Promise<VideoModule | null> {
    const video = await this.videoModuleRepository.findOne({
      where: { id }
    });

    if (!video) {
      return null;
    }

    Object.assign(video, data);
    return await this.videoModuleRepository.save(video);
  }

  /**
   * Remove um vídeo
   */
  async deleteVideo(id: string): Promise<boolean> {
    const result = await this.videoModuleRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Busca coleções para visualização pública (compatível com a API existente)
   */
  async getPublicCollections(): Promise<VideoCollection[]> {
    return await this.videoCollectionRepository.find({
      where: { deleted: false },
      order: {
        popularity: 'DESC',
        vote_average: 'DESC',
        name: 'ASC'
      }
    });
  }

  /**
   * Busca uma coleção específica para visualização pública
   */
  async getPublicCollectionById(id: string): Promise<VideoCollection | null> {
    return await this.videoCollectionRepository.findOne({
      where: { id, deleted: false }
    });
  }

  /**
   * Pesquisa coleções por termo
   */
  async searchCollections(searchTerm: string): Promise<VideoCollection[]> {
    return await this.videoCollectionRepository.find({
      where: [
        { name: Like(`%${searchTerm}%`), deleted: false },
        { synopsis: Like(`%${searchTerm}%`), deleted: false },
        { producer: Like(`%${searchTerm}%`), deleted: false }
      ],
      order: {
        popularity: 'DESC',
        vote_average: 'DESC',
        name: 'ASC'
      }
    });
  }

  /**
   * Busca coleções populares
   */
  async getPopularCollections(limit: number = 10): Promise<VideoCollection[]> {
    return await this.videoCollectionRepository.find({
      where: { 
        deleted: false,
        popularity: Not(IsNull())
      },
      order: {
        popularity: 'DESC',
        vote_average: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Busca coleções mais bem avaliadas
   */
  async getTopRatedCollections(limit: number = 10): Promise<VideoCollection[]> {
    return await this.videoCollectionRepository.find({
      where: { 
        deleted: false,
        vote_average: Not(IsNull())
      },
      order: {
        vote_average: 'DESC',
        vote_count: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Busca coleções recentes
   */
  async getRecentCollections(limit: number = 10): Promise<VideoCollection[]> {
    return await this.videoCollectionRepository.find({
      where: { deleted: false },
      order: {
        created_at: 'DESC',
        updated_at: 'DESC'
      },
      take: limit
    });
  }

  /**
   * Conta total de vídeos em uma coleção
   */
  async getVideoCountForCollection(collectionId: string): Promise<number> {
    return await this.videoModuleRepository.count({
      where: { collection_id: collectionId }
    });
  }

  /**
   * Busca próximo número de módulo disponível
   */
  async getNextModuleNumber(collectionId: string): Promise<number> {
    const result = await this.videoModuleRepository
      .createQueryBuilder('video')
      .select('MAX(video.module_number)', 'maxModule')
      .where('video.collection_id = :collectionId', { collectionId })
      .getRawOne();

    return (result.maxModule || 0) + 1;
  }

  /**
   * Busca próxima ordem disponível em um módulo
   */
  async getNextOrderInModule(collectionId: string, moduleNumber: number): Promise<number> {
    const result = await this.videoModuleRepository
      .createQueryBuilder('video')
      .select('MAX(video.order_in_module)', 'maxOrder')
      .where('video.collection_id = :collectionId', { collectionId })
      .andWhere('video.module_number = :moduleNumber', { moduleNumber })
      .getRawOne();

    return (result.maxOrder || 0) + 1;
  }
} 
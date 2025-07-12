import { AppDataSource } from '../config/typeorm.config';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoModule } from '../entities/VideoModule';
import { Repository, Like } from 'typeorm';

export class VideoCollectionService {
  private videoCollectionRepository: Repository<VideoCollection>;
  private videoModuleRepository: Repository<VideoModule>;

  constructor() {
    this.videoCollectionRepository = AppDataSource.getRepository(VideoCollection);
    this.videoModuleRepository = AppDataSource.getRepository(VideoModule);
  }

  async getAllCollections(): Promise<VideoCollection[]> {
    return this.videoCollectionRepository.find({
      where: { deleted: false },
      relations: ['videos'],
    });
  }

  async getCollectionById(id: string | number): Promise<VideoCollection | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.videoCollectionRepository.findOne({
      where: { id: numericId, deleted: false },
      relations: ['videos'],
    });
  }

  async createCollection(data: Partial<VideoCollection>): Promise<VideoCollection> {
    const collection = this.videoCollectionRepository.create(data);
    return this.videoCollectionRepository.save(collection);
  }

  async updateCollection(id: string | number, data: Partial<VideoCollection>): Promise<VideoCollection | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const collection = await this.videoCollectionRepository.findOneBy({ id: numericId });
    if (!collection) {
      return null;
    }
    this.videoCollectionRepository.merge(collection, data);
    return this.videoCollectionRepository.save(collection);
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await this.videoCollectionRepository.update(id, { deleted: true });
    return result.affected ? result.affected > 0 : false;
  }

  async createVideo(collectionId: string, data: Partial<VideoModule>): Promise<VideoModule> {
    const video = this.videoModuleRepository.create({
      ...data,
      collection_id: parseInt(collectionId, 10),
    });
    return this.videoModuleRepository.save(video);
  }

  async updateVideo(id: string, data: Partial<VideoModule>): Promise<VideoModule | null> {
    const numericId = parseInt(id, 10);
    const video = await this.videoModuleRepository.findOneBy({ id: numericId });
    if (!video) {
      return null;
    }
    this.videoModuleRepository.merge(video, data);
    return this.videoModuleRepository.save(video);
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await this.videoModuleRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  async getCollectionWithVideos(id: string | number): Promise<VideoCollection | null> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return this.videoCollectionRepository.findOne({
      where: { id: numericId, deleted: false },
      relations: ['videos'],
      order: {
        videos: {
          module_number: 'ASC',
          order_in_module: 'ASC'
        }
      }
    });
  }

  async getAllCollectionsForManagement(): Promise<any[]> {
    const collections = await this.videoCollectionRepository.find({
      where: { deleted: false }
    });

    const result = [];
    for (const collection of collections) {
      const videoCount = await this.getVideoCountForCollection(collection.id);
      result.push({
        ...collection,
        video_count: videoCount
      });
    }
    return result;
  }

  async getPublicCollections(): Promise<VideoCollection[]> {
    return this.videoCollectionRepository.find({
      where: { deleted: false },
      relations: ['videos']
    });
  }

  async searchCollections(query: string): Promise<VideoCollection[]> {
    return this.videoCollectionRepository.find({
      where: [
        { name: Like(`%${query}%`), deleted: false },
        { synopsis: Like(`%${query}%`), deleted: false }
      ],
      relations: ['videos']
    });
  }

  async getNextModuleNumber(collectionId: string | number): Promise<number> {
    const maxModule = await this.videoModuleRepository
      .createQueryBuilder('video')
      .select('MAX(video.module_number)', 'max')
      .where('video.collection_id = :collectionId', { collectionId })
      .getRawOne();
    
    return (maxModule?.max || 0) + 1;
  }

  async getNextOrderInModule(collectionId: string | number, moduleNumber: number): Promise<number> {
    const maxOrder = await this.videoModuleRepository
      .createQueryBuilder('video')
      .select('MAX(video.order_in_module)', 'max')
      .where('video.collection_id = :collectionId', { collectionId })
      .andWhere('video.module_number = :moduleNumber', { moduleNumber })
      .getRawOne();
    
    return (maxOrder?.max || 0) + 1;
  }

  async getVideoCountForCollection(collectionId: string | number): Promise<number> {
    const numericId = typeof collectionId === 'string' ? parseInt(collectionId, 10) : collectionId;
    return this.videoModuleRepository.count({
      where: { collection_id: numericId }
    });
  }
}
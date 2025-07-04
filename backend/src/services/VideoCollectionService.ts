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

  async getCollectionById(id: string): Promise<VideoCollection | null> {
    return this.videoCollectionRepository.findOne({
      where: { id, deleted: false },
      relations: ['videos'],
    });
  }

  async createCollection(data: Partial<VideoCollection>): Promise<VideoCollection> {
    const collection = this.videoCollectionRepository.create(data);
    return this.videoCollectionRepository.save(collection);
  }

  async updateCollection(id: string, data: Partial<VideoCollection>): Promise<VideoCollection | null> {
    const collection = await this.videoCollectionRepository.findOneBy({ id });
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
      collection_id: collectionId,
    });
    return this.videoModuleRepository.save(video);
  }

  async updateVideo(id: string, data: Partial<VideoModule>): Promise<VideoModule | null> {
    const video = await this.videoModuleRepository.findOneBy({ id });
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
}
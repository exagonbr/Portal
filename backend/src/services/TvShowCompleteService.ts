import { AppDataSource } from '../config/typeorm.config';
import { VideoCollection } from '../entities/VideoCollection';
import { VideoModule } from '../entities/VideoModule';
import { Repository, Like } from 'typeorm';

export class TvShowCompleteService {
  private videoCollectionRepository: Repository<VideoCollection>;
  private videoModuleRepository: Repository<VideoModule>;

  constructor() {
    this.videoCollectionRepository = AppDataSource.getRepository(VideoCollection);
    this.videoModuleRepository = AppDataSource.getRepository(VideoModule);
  }

  async getAllTvShows(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.videoCollectionRepository.createQueryBuilder('collection')
      .leftJoinAndSelect('collection.videos', 'video')
      .where('collection.deleted = :deleted', { deleted: false });

    if (search) {
      queryBuilder.andWhere('(collection.name LIKE :search OR collection.producer LIKE :search)', { search: `%${search}%` });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('collection.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const collections = await queryBuilder.getMany();

    return {
      tvShows: collections,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTvShowById(id: string) {
    return this.videoCollectionRepository.findOne({
      where: { id, deleted: false },
      relations: ['videos'],
    });
  }
}

export default new TvShowCompleteService();
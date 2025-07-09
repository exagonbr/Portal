import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Video } from '../entities/Video';
import { VideoFilterDto } from '../dto/VideoDto';

export class VideoRepository {
  private repository: Repository<Video>;

  constructor() {
    this.repository = AppDataSource.getRepository(Video);
  }

  async findAll(filters: VideoFilterDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      deleted, 
      class: videoClass, 
      showId, 
      seasonNumber, 
      episodeNumber,
      originalLanguage 
    } = filters;
    
    const queryBuilder = this.repository.createQueryBuilder('video');
    
    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere(
        '(video.title ILIKE :search OR video.name ILIKE :search OR video.overview ILIKE :search)', 
        { search: `%${search}%` }
      );
    }
    
    if (deleted !== undefined) {
      queryBuilder.andWhere('video.deleted = :deleted', { deleted });
    }
    
    if (videoClass) {
      queryBuilder.andWhere('video.class = :class', { class: videoClass });
    }
    
    if (showId) {
      queryBuilder.andWhere('video.showId = :showId', { showId });
    }
    
    if (seasonNumber) {
      queryBuilder.andWhere('video.seasonNumber = :seasonNumber', { seasonNumber });
    }
    
    if (episodeNumber) {
      queryBuilder.andWhere('video.episodeNumber = :episodeNumber', { episodeNumber });
    }
    
    if (originalLanguage) {
      queryBuilder.andWhere('video.originalLanguage = :originalLanguage', { originalLanguage });
    }
    
    // Paginação
    const total = await queryBuilder.getCount();
    const videos = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('video.dateCreated', 'DESC')
      .getMany();
    
    return {
      data: videos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number): Promise<Video | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['videoFiles']
    });
  }

  async create(videoData: Partial<Video>): Promise<Video> {
    const video = this.repository.create(videoData);
    return await this.repository.save(video);
  }

  async update(id: number, videoData: Partial<Video>): Promise<Video | null> {
    await this.repository.update(id, videoData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async restore(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { deleted: false });
    return (result.affected ?? 0) > 0;
  }

  async findByShow(showId: number): Promise<Video[]> {
    return await this.repository.find({
      where: { showId, deleted: false },
      order: { seasonNumber: 'ASC', episodeNumber: 'ASC' }
    });
  }

  async findBySeason(showId: number, seasonNumber: number): Promise<Video[]> {
    return await this.repository.find({
      where: { showId, seasonNumber, deleted: false },
      order: { episodeNumber: 'ASC' }
    });
  }

  async findByClass(videoClass: string): Promise<Video[]> {
    return await this.repository.find({
      where: { class: videoClass, deleted: false }
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async getStats() {
    const [total, active, byClass] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { deleted: false } }),
      this.repository.createQueryBuilder('video')
        .select('video.class', 'class')
        .addSelect('COUNT(*)', 'count')
        .where('video.deleted = false')
        .groupBy('video.class')
        .getRawMany()
    ]);

    return {
      total,
      active,
      byClass: byClass.reduce((acc, item) => {
        acc[item.class] = parseInt(item.count);
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

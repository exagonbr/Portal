import { Repository, DeleteResult } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Video } from '../entities/Video';
import { VideoFilterDto } from '../dto/VideoDto';

export class VideoRepository {
  private repository: Repository<Video>;

  constructor() {
    this.repository = AppDataSource.getRepository(Video);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Video>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('video');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('video.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('video.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM video
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM video
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de video:`, error);
      throw error;
    }
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

  async findActive(limit: number = 100): Promise<any[]> {
    return this.find({
      where: { deleted: false },
      take: limit,
      order: { id: 'DESC' }
    });
  }

  async findByIdActive(id: string | number): Promise<any | null> {
    return this.findOne({
      where: { id: id as any, deleted: false }
    });
  }

  async findWithPagination(page: number = 1, limit: number = 10): Promise<{ data: any[], total: number }> {
    const [data, total] = await this.findAndCount({
      where: { deleted: false },
      skip: (page - 1) * limit,
      take: limit,
      order: { id: 'DESC' }
    });
    return { data, total };
  }

  async searchByName(name: string): Promise<any[]> {
    return this.createQueryBuilder()
      .where("LOWER(name) LIKE LOWER(:name)", { name: `%${name}%` })
      .andWhere("deleted = :deleted", { deleted: false })
      .getMany();
  }

  async softDelete(id: string | number): Promise<void> {
    await this.update(id as any, { deleted: true });
  }


  async save(entity: any): Promise<any> {
    return await this.manager.save(entity);
  }

}

import { Repository, DeleteResult } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Files } from '../entities/Files';
import { FilesFilterDto } from '../dto/FilesDto';

export class FilesRepository {
  private repository: Repository<Files>;

  constructor() {
    this.repository = AppDataSource.getRepository(Files);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Files>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('files');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('files.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('files.id', 'DESC')
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
          SELECT * FROM files
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM files
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
      console.error(`Erro ao buscar registros de files:`, error);
      throw error;
    }
  }

  async findAll(filters: FilesFilterDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      contentType,
      extension,
      isDefault,
      isPublic,
      quality,
      isSubtitled
    } = filters;
    
    const queryBuilder = this.repository.createQueryBuilder('files');
    
    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere(
        '(files.name ILIKE :search OR files.originalFilename ILIKE :search OR files.label ILIKE :search)', 
        { search: `%${search}%` }
      );
    }
    
    if (contentType) {
      queryBuilder.andWhere('files.contentType = :contentType', { contentType });
    }
    
    if (extension) {
      queryBuilder.andWhere('files.extension = :extension', { extension });
    }
    
    if (isDefault !== undefined) {
      queryBuilder.andWhere('files.isDefault = :isDefault', { isDefault });
    }
    
    if (isPublic !== undefined) {
      queryBuilder.andWhere('files.isPublic = :isPublic', { isPublic });
    }
    
    if (quality) {
      queryBuilder.andWhere('files.quality = :quality', { quality });
    }
    
    if (isSubtitled !== undefined) {
      queryBuilder.andWhere('files.isSubtitled = :isSubtitled', { isSubtitled });
    }
    
    // Paginação
    const total = await queryBuilder.getCount();
    const files = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('files.dateCreated', 'DESC')
      .getMany();
    
    return {
      data: files,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number): Promise<Files | null> {
    return await this.repository.findOne({
      where: { id }
    });
  }

  async create(filesData: Partial<Files>): Promise<Files> {
    const file = this.repository.create(filesData);
    return await this.repository.save(file);
  }

  async update(id: number, filesData: Partial<Files>): Promise<Files | null> {
    await this.repository.update(id, filesData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByContentType(contentType: string): Promise<Files[]> {
    return await this.repository.find({
      where: { contentType }
    });
  }

  async findByExtension(extension: string): Promise<Files[]> {
    return await this.repository.find({
      where: { extension }
    });
  }

  async findPublicFiles(): Promise<Files[]> {
    return await this.repository.find({
      where: { isPublic: true }
    });
  }

  async findSubtitledFiles(): Promise<Files[]> {
    return await this.repository.find({
      where: { isSubtitled: true }
    });
  }

  async findBySha256(sha256hex: string): Promise<Files | null> {
    return await this.repository.findOne({
      where: { sha256hex }
    });
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async getStats() {
    const [total, public_files, subtitled, byContentType, byExtension] = await Promise.all([
      this.repository.count(),
      this.repository.count({ where: { isPublic: true } }),
      this.repository.count({ where: { isSubtitled: true } }),
      this.repository.createQueryBuilder('files')
        .select('files.contentType', 'contentType')
        .addSelect('COUNT(*)', 'count')
        .groupBy('files.contentType')
        .getRawMany(),
      this.repository.createQueryBuilder('files')
        .select('files.extension', 'extension')
        .addSelect('COUNT(*)', 'count')
        .groupBy('files.extension')
        .getRawMany()
    ]);

    return {
      total,
      public: public_files,
      subtitled,
      byContentType: byContentType.reduce((acc, item) => {
        if (item.contentType) {
          acc[item.contentType] = parseInt(item.count);
        }
        return acc;
      }, {} as Record<string, number>),
      byExtension: byExtension.reduce((acc, item) => {
        if (item.extension) {
          acc[item.extension] = parseInt(item.count);
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }

  async getTotalSize(): Promise<number> {
    const result = await this.repository.createQueryBuilder('files')
      .select('SUM(files.size)', 'totalSize')
      .getRawOne();
    
    return parseInt(result?.totalSize) || 0;
  }
} 
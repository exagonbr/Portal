import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { VideoFile } from '../entities/VideoFile';
import { VideoFileFilterDto } from '../dto/VideoFileDto';

export class VideoFileRepository {
  private repository: Repository<VideoFile>;

  constructor() {
    this.repository = AppDataSource.getRepository(VideoFile);
  }

  async findAll(filters: VideoFileFilterDto = {}) {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      videoFilesId, 
      fileId 
    } = filters;
    
    const queryBuilder = this.repository.createQueryBuilder('videoFile')
      .leftJoinAndSelect('videoFile.video', 'video')
      .leftJoinAndSelect('videoFile.file', 'file');
    
    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere(
        '(video.title ILIKE :search OR video.name ILIKE :search OR file.name ILIKE :search)', 
        { search: `%${search}%` }
      );
    }
    
    if (videoFilesId) {
      queryBuilder.andWhere('videoFile.videoFilesId = :videoFilesId', { videoFilesId });
    }
    
    if (fileId) {
      queryBuilder.andWhere('videoFile.fileId = :fileId', { fileId });
    }
    
    // Paginação
    const total = await queryBuilder.getCount();
    const videoFiles = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('videoFile.createdAt', 'DESC')
      .getMany();
    
    return {
      data: videoFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: number): Promise<VideoFile | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['video', 'file']
    });
  }

  async create(videoFileData: Partial<VideoFile>): Promise<VideoFile> {
    const videoFile = this.repository.create(videoFileData);
    return await this.repository.save(videoFile);
  }

  async update(id: number, videoFileData: Partial<VideoFile>): Promise<VideoFile | null> {
    await this.repository.update(id, videoFileData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByVideo(videoFilesId: number): Promise<VideoFile[]> {
    return await this.repository.find({
      where: { videoFilesId },
      relations: ['file']
    });
  }

  async findByFile(fileId: number): Promise<VideoFile[]> {
    return await this.repository.find({
      where: { fileId },
      relations: ['video']
    });
  }

  async deleteByVideo(videoFilesId: number): Promise<boolean> {
    const result = await this.repository.delete({ videoFilesId });
    return (result.affected ?? 0) > 0;
  }

  async deleteByFile(fileId: number): Promise<boolean> {
    const result = await this.repository.delete({ fileId });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async getVideoFileStats() {
    const [total, byFileType] = await Promise.all([
      this.repository.count(),
      this.repository.createQueryBuilder('videoFile')
        .leftJoin('videoFile.file', 'file')
        .select('file.extension', 'extension')
        .addSelect('COUNT(*)', 'count')
        .groupBy('file.extension')
        .getRawMany()
    ]);

    return {
      total,
      byFileType: byFileType.reduce((acc, item) => {
        if (item.extension) {
          acc[item.extension] = parseInt(item.count);
        }
        return acc;
      }, {} as Record<string, number>)
    };
  }
} 
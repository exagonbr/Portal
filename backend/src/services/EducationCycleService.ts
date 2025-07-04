import { AppDataSource } from '../config/typeorm.config';
import { EducationCycle, EducationLevel } from '../entities/EducationCycle';
import { Repository } from 'typeorm';

export interface EducationCycleDto {
  id: string;
  name: string;
  level: EducationLevel;
  description?: string;
  durationYears: number;
}

export interface EducationCycleFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    level?: EducationLevel;
}

export class EducationCycleService {
  private educationCycleRepository: Repository<EducationCycle>;

  constructor() {
    this.educationCycleRepository = AppDataSource.getRepository(EducationCycle);
  }

  async findEducationCyclesWithFilters(filters: EducationCycleFilterDto): Promise<{ cycles: EducationCycleDto[], total: number }> {
    const { page = 1, limit = 10, search, level } = filters;
    const queryBuilder = this.educationCycleRepository.createQueryBuilder('cycle');

    if (search) {
      queryBuilder.where('(cycle.name LIKE :search OR cycle.description LIKE :search)', { search: `%${search}%` });
    }
    if (level) {
        queryBuilder.andWhere('cycle.level = :level', { level });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('cycle.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const cycles = await queryBuilder.getMany();

    const mappedCycles = cycles.map(cycle => ({
        id: cycle.id,
        name: cycle.name,
        level: cycle.level,
        description: cycle.description,
        durationYears: cycle.duration_years,
    }));

    return { cycles: mappedCycles, total };
  }

  async findEducationCycleById(id: string): Promise<EducationCycle | null> {
    return this.educationCycleRepository.findOneBy({ id });
  }

  async createEducationCycle(data: Partial<EducationCycle>): Promise<EducationCycle> {
    const cycle = this.educationCycleRepository.create(data);
    return this.educationCycleRepository.save(cycle);
  }

  async updateEducationCycle(id: string, data: Partial<EducationCycle>): Promise<EducationCycle | null> {
    const cycle = await this.educationCycleRepository.findOneBy({ id });
    if (!cycle) {
      return null;
    }
    this.educationCycleRepository.merge(cycle, data);
    return this.educationCycleRepository.save(cycle);
  }

  async deleteEducationCycle(id: string): Promise<boolean> {
    const result = await this.educationCycleRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

export default new EducationCycleService();
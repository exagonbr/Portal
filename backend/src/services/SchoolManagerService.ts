import { AppDataSource } from '../config/typeorm.config';
import { SchoolManager, ManagerPosition } from '../entities/SchoolManager';
import { School } from '../entities/School';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

export interface SchoolManagerDto {
  id: string;
  userId: string;
  schoolId: string;
  position: ManagerPosition;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface SchoolManagerFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    userId?: string;
    position?: ManagerPosition;
}

export class SchoolManagerService {
  private schoolManagerRepository: Repository<SchoolManager>;

  constructor() {
    this.schoolManagerRepository = AppDataSource.getRepository(SchoolManager);
  }

  async findSchoolManagersWithFilters(filters: SchoolManagerFilterDto): Promise<{ managers: SchoolManagerDto[], total: number }> {
    const { page = 1, limit = 10, search, schoolId, userId, position } = filters;
    const queryBuilder = this.schoolManagerRepository.createQueryBuilder('manager')
        .leftJoinAndSelect('manager.user', 'user')
        .leftJoinAndSelect('manager.school', 'school')
        .where('manager.is_active = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere('(user.fullName LIKE :search OR school.name LIKE :search)', { search: `%${search}%` });
    }
    if (schoolId) {
        queryBuilder.andWhere('manager.school_id = :schoolId', { schoolId });
    }
    if (userId) {
        queryBuilder.andWhere('manager.user_id = :userId', { userId });
    }
    if (position) {
        queryBuilder.andWhere('manager.position = :position', { position });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('user.fullName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const managers = await queryBuilder.getMany();

    const mappedManagers = managers.map(m => ({
        id: m.id,
        userId: m.user_id,
        schoolId: m.school_id,
        position: m.position,
        startDate: m.start_date,
        endDate: m.end_date,
        isActive: m.is_active,
    }));

    return { managers: mappedManagers, total };
  }

  async findSchoolManagerById(id: string): Promise<SchoolManager | null> {
    return this.schoolManagerRepository.findOne({ 
        where: { id },
        relations: ['user', 'school']
    });
  }

  async createSchoolManager(data: Partial<SchoolManager>): Promise<SchoolManager> {
    const manager = this.schoolManagerRepository.create(data);
    return this.schoolManagerRepository.save(manager);
  }

  async updateSchoolManager(id: string, data: Partial<SchoolManager>): Promise<SchoolManager | null> {
    const manager = await this.schoolManagerRepository.findOneBy({ id });
    if (!manager) {
      return null;
    }
    this.schoolManagerRepository.merge(manager, data);
    return this.schoolManagerRepository.save(manager);
  }

  async deleteSchoolManager(id: string): Promise<boolean> {
    const result = await this.schoolManagerRepository.update(id, { is_active: false });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new SchoolManagerService();
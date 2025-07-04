import { AppDataSource } from '../config/typeorm.config';
import { School } from '../entities/School';
import { Repository } from 'typeorm';

export interface SchoolDto {
  id: number;
  name: string;
  institutionId: number;
  institutionName?: string;
}

export interface SchoolFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    institutionId?: number;
}

export class SchoolService {
  private schoolRepository: Repository<School>;

  constructor() {
    this.schoolRepository = AppDataSource.getRepository(School);
  }

  async findSchoolsWithFilters(filters: SchoolFilterDto): Promise<{ schools: SchoolDto[], total: number }> {
    const { page = 1, limit = 10, search, institutionId } = filters;
    const queryBuilder = this.schoolRepository.createQueryBuilder('school')
        .leftJoinAndSelect('school.institution', 'institution')
        .where('school.deleted IS NOT TRUE');

    if (search) {
      queryBuilder.andWhere('school.name LIKE :search', { search: `%${search}%` });
    }
    
    if (institutionId) {
        queryBuilder.andWhere('school.institutionId = :institutionId', { institutionId });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('school.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const schools = await queryBuilder.getMany();

    const mappedSchools = schools.map(school => ({
        id: school.id,
        name: school.name,
        institutionId: school.institutionId,
        institutionName: school.institution?.name,
    }));

    return { schools: mappedSchools, total };
  }

  async findSchoolById(id: number): Promise<School | null> {
    return this.schoolRepository.findOne({ 
        where: { id },
        relations: ['institution']
    });
  }

  async createSchool(data: Partial<School>): Promise<School> {
    const school = this.schoolRepository.create(data);
    return this.schoolRepository.save(school);
  }

  async updateSchool(id: number, data: Partial<School>): Promise<School | null> {
    const school = await this.schoolRepository.findOneBy({ id });
    if (!school) {
      return null;
    }
    this.schoolRepository.merge(school, data);
    return this.schoolRepository.save(school);
  }

  async deleteSchool(id: number): Promise<boolean> {
    const result = await this.schoolRepository.update(id, { deleted: true });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new SchoolService();
import { AppDataSource } from '../config/typeorm.config';
import { Class, ShiftType } from '../entities/Class';
import { School } from '../entities/School';
import { Repository } from 'typeorm';

export interface ClassDto {
  id: string;
  name: string;
  code: string;
  schoolId: string;
  year: number;
  shift: ShiftType;
  maxStudents: number;
  isActive: boolean;
}

export interface ClassFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    schoolId?: string;
    year?: number;
    shift?: ShiftType;
}

export class ClassService {
  private classRepository: Repository<Class>;
  private schoolRepository: Repository<School>;

  constructor() {
    this.classRepository = AppDataSource.getRepository(Class);
    this.schoolRepository = AppDataSource.getRepository(School);
  }

  async findClassesWithFilters(filters: ClassFilterDto): Promise<{ classes: ClassDto[], total: number }> {
    const { page = 1, limit = 10, search, schoolId, year, shift } = filters;
    const queryBuilder = this.classRepository.createQueryBuilder('class')
        .leftJoinAndSelect('class.school', 'school')
        .where('class.is_active = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere('(class.name LIKE :search OR class.code LIKE :search)', { search: `%${search}%` });
    }
    if (schoolId) {
        queryBuilder.andWhere('class.school_id = :schoolId', { schoolId });
    }
    if (year) {
        queryBuilder.andWhere('class.year = :year', { year });
    }
    if (shift) {
        queryBuilder.andWhere('class.shift = :shift', { shift });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('class.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const classes = await queryBuilder.getMany();

    const mappedClasses = classes.map(c => ({
        id: c.id,
        name: c.name,
        code: c.code,
        schoolId: c.school_id,
        year: c.year,
        shift: c.shift,
        maxStudents: c.max_students,
        isActive: c.is_active,
    }));

    return { classes: mappedClasses, total };
  }

  async findClassById(id: string): Promise<Class | null> {
    return this.classRepository.findOne({ 
        where: { id },
        relations: ['school']
    });
  }

  async createClass(data: Partial<Class>): Promise<Class> {
    const classEntity = this.classRepository.create(data);
    return this.classRepository.save(classEntity);
  }

  async updateClass(id: string, data: Partial<Class>): Promise<Class | null> {
    const classEntity = await this.classRepository.findOneBy({ id });
    if (!classEntity) {
      return null;
    }
    this.classRepository.merge(classEntity, data);
    return this.classRepository.save(classEntity);
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await this.classRepository.update(id, { is_active: false });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new ClassService();
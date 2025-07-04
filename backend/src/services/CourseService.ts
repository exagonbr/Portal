import { AppDataSource } from '../config/typeorm.config';
import { Course } from '../entities/Course';
import { User } from '../entities/User';
import { Institution } from '../entities/Institution';
import { Repository } from 'typeorm';

export interface CourseDto {
  id: string;
  name: string;
  description?: string;
  institutionId: string;
  teacherId?: string;
  isActive: boolean;
}

export interface CourseFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    institutionId?: string;
    teacherId?: string;
}

export class CourseService {
  private courseRepository: Repository<Course>;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  async findCoursesWithFilters(filters: CourseFilterDto): Promise<{ courses: CourseDto[], total: number }> {
    const { page = 1, limit = 10, search, institutionId, teacherId } = filters;
    const queryBuilder = this.courseRepository.createQueryBuilder('course')
        .leftJoinAndSelect('course.institution', 'institution')
        .leftJoinAndSelect('course.teacher', 'teacher')
        .where('course.is_active = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere('(course.name LIKE :search OR course.description LIKE :search)', { search: `%${search}%` });
    }
    if (institutionId) {
        queryBuilder.andWhere('course.institution_id = :institutionId', { institutionId });
    }
    if (teacherId) {
        queryBuilder.andWhere('course.teacher_id = :teacherId', { teacherId });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('course.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const courses = await queryBuilder.getMany();

    const mappedCourses = courses.map(course => ({
        id: course.id,
        name: course.name,
        description: course.description,
        institutionId: course.institution_id,
        teacherId: course.teacher_id,
        isActive: course.is_active,
    }));

    return { courses: mappedCourses, total };
  }

  async findCourseById(id: string): Promise<Course | null> {
    return this.courseRepository.findOne({ 
        where: { id },
        relations: ['institution', 'teacher', 'students']
    });
  }

  async createCourse(data: Partial<Course>): Promise<Course> {
    const course = this.courseRepository.create(data);
    return this.courseRepository.save(course);
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course | null> {
    const course = await this.courseRepository.findOneBy({ id });
    if (!course) {
      return null;
    }
    this.courseRepository.merge(course, data);
    return this.courseRepository.save(course);
  }

  async deleteCourse(id: string): Promise<boolean> {
    const result = await this.courseRepository.update(id, { is_active: false });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new CourseService();
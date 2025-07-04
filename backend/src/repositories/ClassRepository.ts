import { BaseRepository } from './BaseRepository';
import { Class, ShiftType } from '../entities/Class';

export interface CreateClassData extends Omit<Class, 'id' | 'created_at' | 'updated_at' | 'school' | 'userClasses' | 'educationCycles' | 'school_name' | 'student_count' | 'teacher_count'> {}
export interface UpdateClassData extends Partial<CreateClassData> {}

export interface ClassFilters {
  search?: string;
  school_id?: string;
  year?: number;
  shift?: ShiftType;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof Class;
  sortOrder?: 'asc' | 'desc';
}

export class ClassRepository extends BaseRepository<Class> {
  constructor() {
    super('classes');
  }

  async createClass(data: CreateClassData): Promise<Class> {
    return this.create(data);
  }

  async updateClass(id: string, data: UpdateClassData): Promise<Class | null> {
    return this.update(id, data);
  }

  async findBySchool(schoolId: string): Promise<Class[]> {
    return this.findAll({ school_id: parseInt(schoolId, 10) });
  }

  async findByCode(schoolId: string, code: string): Promise<Class | null> {
    return this.findOne({ school_id: parseInt(schoolId, 10), code });
  }

  async findWithFilters(filters: ClassFilters): Promise<{ data: Class[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      ...otherFilters
    } = filters;

    const query = this.db(this.tableName).select('*');
    const countQuery = this.db(this.tableName).count('* as total').first();

    if (search) {
      query.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
      countQuery.where(builder => {
        builder
          .where('name', 'ilike', `%${search}%`)
          .orWhere('code', 'ilike', `%${search}%`);
      });
    }

    if (Object.keys(otherFilters).length > 0) {
        query.where(otherFilters);
        countQuery.where(otherFilters);
    }
    
    query.orderBy(sortBy, sortOrder).limit(limit).offset((page - 1) * limit);

    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }
}
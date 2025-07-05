import { AppDataSource } from '../config/typeorm.config';
import { UserClass, UserClassRole } from '../entities/UserClass';
import { Class } from '../entities/Class';
import { User } from '../entities/User';
import { Repository } from 'typeorm';

export interface UserClassDto {
  id: string;
  userId: string;
  classId: string;
  role: UserClassRole;
  enrollmentDate: Date;
  exitDate?: Date;
  isActive: boolean;
}

export interface UserClassFilterDto {
    page?: number;
    limit?: number;
    search?: string;
    classId?: string;
    userId?: string;
    role?: UserClassRole;
}

export class UserClassService {
  private userClassRepository: Repository<UserClass>;

  constructor() {
    this.userClassRepository = AppDataSource.getRepository(UserClass);
  }

  async findUserClassesWithFilters(filters: UserClassFilterDto): Promise<{ userClasses: UserClassDto[], total: number }> {
    const { page = 1, limit = 10, search, classId, userId, role } = filters;
    const queryBuilder = this.userClassRepository.createQueryBuilder('userClass')
        .leftJoinAndSelect('userClass.user', 'user')
        .leftJoinAndSelect('userClass.class', 'class')
        .where('userClass.is_active = :isActive', { isActive: true });

    if (search) {
      queryBuilder.andWhere('(user.fullName LIKE :search OR class.name LIKE :search)', { search: `%${search}%` });
    }
    if (classId) {
        queryBuilder.andWhere('userClass.class_id = :classId', { classId });
    }
    if (userId) {
        queryBuilder.andWhere('userClass.user_id = :userId', { userId });
    }
    if (role) {
        queryBuilder.andWhere('userClass.role = :role', { role });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder
      .orderBy('user.fullName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const userClasses = await queryBuilder.getMany();

    const mappedUserClasses = userClasses.map(uc => ({
        id: uc.id,
        userId: uc.user_id,
        classId: uc.class_id,
        role: uc.role,
        enrollmentDate: uc.enrollment_date,
        exitDate: uc.exit_date,
        isActive: uc.is_active,
    }));

    return { userClasses: mappedUserClasses, total };
  }

  async findUserClassById(id: string): Promise<UserClass | null> {
    return this.userClassRepository.findOne({ 
        where: { id },
        relations: ['user', 'class']
    });
  }

  async createUserClass(data: Partial<UserClass>): Promise<UserClass> {
    const userClass = this.userClassRepository.create(data);
    return this.userClassRepository.save(userClass);
  }

  async updateUserClass(id: string, data: Partial<UserClass>): Promise<UserClass | null> {
    const userClass = await this.userClassRepository.findOneBy({ id });
    if (!userClass) {
      return null;
    }
    this.userClassRepository.merge(userClass, data);
    return this.userClassRepository.save(userClass);
  }

  async deleteUserClass(id: string): Promise<boolean> {
    const result = await this.userClassRepository.update(id, { is_active: false });
    return result.affected ? result.affected > 0 : false;
  }
}

export default new UserClassService();
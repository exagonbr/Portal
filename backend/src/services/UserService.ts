import { AppDataSource } from '../config/typeorm.config';
import { User } from '../entities/User';
import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';

// Data Transfer Objects (DTOs)
export interface UserResponseDto {
  id: number;
  fullName: string;
  email: string;
  enabled?: boolean;
  role?: { authority?: string };
  institution?: { name: string };
}

export interface UsersListResult {
  items: UserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UsersFilterData {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    institutionId?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export type CreateUsersData = Partial<User> & { password?: string };
export type UpdateUsersData = Partial<User> & { password?: string };

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  private toUserResponseDto(user: User): UserResponseDto {
    const { password, ...rest } = user;
    return {
      id: rest.id,
      fullName: rest.fullName,
      email: rest.email,
      enabled: rest.enabled,
      role: rest.role ? { authority: rest.role.authority } : undefined,
      institution: rest.institution ? { name: rest.institution.name } : undefined,
    };
  }

  async getUsers(filters: UsersFilterData = {}): Promise<UsersListResult> {
    const { page = 1, limit = 10, search, role, institutionId, sortBy = 'fullName', sortOrder = 'ASC' } = filters;
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.institution', 'institution')
      .where('user.deleted IS NOT TRUE');

    if (search) {
      queryBuilder.andWhere('(user.fullName LIKE :search OR user.email LIKE :search)', { search: `%${search}%` });
    }
    if (role) {
      queryBuilder.andWhere('role.authority = :role', { role });
    }
    if (institutionId) {
      queryBuilder.andWhere('user.institutionId = :institutionId', { institutionId });
    }

    const total = await queryBuilder.getCount();
    
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const users = await queryBuilder.getMany();
    const totalPages = Math.ceil(total / limit);

    return {
      items: users.map(u => this.toUserResponseDto(u)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role', 'institution'],
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['role', 'institution'],
    });
  }

  async createUser(data: CreateUsersData): Promise<User> {
    const { password, ...restData } = data;
    const user = this.userRepository.create(restData);

    if (password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(password, salt);
    }

    return this.userRepository.save(user);
  }

  async updateUser(id: number, data: UpdateUsersData): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      return null;
    }

    const { password, ...restData } = data;
    const updatePayload: Partial<User> = restData;

    if (password) {
      const salt = await bcrypt.genSalt(12);
      updatePayload.password = await bcrypt.hash(password, salt);
    }
    
    this.userRepository.merge(user, updatePayload);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return result.affected ? result.affected > 0 : false;
  }
}

export default new UserService();
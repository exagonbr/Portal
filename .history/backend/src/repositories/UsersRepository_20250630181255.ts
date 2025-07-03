import { Repository, DataSource } from 'typeorm';
import { Users } from '../entities/Users';
import { CreateUsersData, UpdateUsersData, UsersWithoutPassword } from '../models/Users';

export class UsersRepository {
  private repository: Repository<Users>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Users);
  }

  async findAll(): Promise<UsersWithoutPassword[]> {
    const users = await this.repository.find({
      relations: ['role', 'institution'],
      select: {
        id: true,
        email: true,
        fullName: true,
        username: true,
        isAdmin: true,
        isManager: true,
        isStudent: true,
        isTeacher: true,
        isGuardian: true,
        isCoordinator: true,
        isInstitutionManager: true,
        enabled: true,
        dateCreated: true,
        lastUpdated: true,
        // Excluir password da seleção
      }
    });
    return users as UsersWithoutPassword[];
  }

  async findById(id: number): Promise<Users | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['role', 'institution']
    });
  }

  async findByEmail(email: string): Promise<Users | null> {
    return await this.repository.findOne({
      where: { email },
      relations: ['role', 'institution']
    });
  }

  async findByUsername(username: string): Promise<Users | null> {
    return await this.repository.findOne({
      where: { username },
      relations: ['role', 'institution']
    });
  }

  async findByGoogleId(googleId: string): Promise<Users | null> {
    return await this.repository.findOne({
      where: { googleId },
      relations: ['role', 'institution']
    });
  }

  async findByRole(roleId: string): Promise<Users[]> {
    return await this.repository.find({
      where: { roleId },
      relations: ['role', 'institution']
    });
  }

  async findByInstitution(institutionId: number): Promise<Users[]> {
    return await this.repository.find({
      where: { institutionId },
      relations: ['role', 'institution']
    });
  }

  async findAdmins(): Promise<Users[]> {
    return await this.repository.find({
      where: { isAdmin: true },
      relations: ['role', 'institution']
    });
  }

  async findTeachers(): Promise<Users[]> {
    return await this.repository.find({
      where: { isTeacher: true },
      relations: ['role', 'institution']
    });
  }

  async findStudents(): Promise<Users[]> {
    return await this.repository.find({
      where: { isStudent: true },
      relations: ['role', 'institution']
    });
  }

  async findGuardians(): Promise<Users[]> {
    return await this.repository.find({
      where: { isGuardian: true },
      relations: ['role', 'institution']
    });
  }

  async findCoordinators(): Promise<Users[]> {
    return await this.repository.find({
      where: { isCoordinator: true },
      relations: ['role', 'institution']
    });
  }

  async findInstitutionManagers(): Promise<Users[]> {
    return await this.repository.find({
      where: { isInstitutionManager: true },
      relations: ['role', 'institution']
    });
  }

  async create(userData: CreateUsersData): Promise<Users> {
    const user = this.repository.create(userData);
    return await this.repository.save(user);
  }

  async update(id: number, userData: UpdateUsersData): Promise<Users | null> {
    await this.repository.update(id, userData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== null && result.affected > 0;
  }

  async softDelete(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { deleted: true });
    return (result.affected ?? 0) > 0;
  }

  async activate(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { enabled: true });
    return (result.affected ?? 0) > 0;
  }

  async deactivate(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { enabled: false });
    return (result.affected ?? 0) > 0;
  }

  async resetPassword(id: number): Promise<boolean> {
    const result = await this.repository.update(id, {
      resetPassword: true,
      passwordExpired: true
    });
    return (result.affected ?? 0) > 0;
  }

  async updatePassword(id: number, newPassword: string): Promise<boolean> {
    const result = await this.repository.update(id, {
      password: newPassword,
      resetPassword: false,
      passwordExpired: false
    });
    return (result.affected ?? 0) > 0;
  }

  async lockAccount(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { accountLocked: true });
    return (result.affected ?? 0) > 0;
  }

  async unlockAccount(id: number): Promise<boolean> {
    const result = await this.repository.update(id, { accountLocked: false });
    return (result.affected ?? 0) > 0;
  }

  async count(): Promise<number> {
    return await this.repository.count();
  }

  async countByType(type: 'admin' | 'teacher' | 'student' | 'guardian' | 'coordinator' | 'manager'): Promise<number> {
    switch (type) {
      case 'admin':
        return await this.repository.count({ where: { isAdmin: true } });
      case 'teacher':
        return await this.repository.count({ where: { isTeacher: true } });
      case 'student':
        return await this.repository.count({ where: { isStudent: true } });
      case 'guardian':
        return await this.repository.count({ where: { isGuardian: true } });
      case 'coordinator':
        return await this.repository.count({ where: { isCoordinator: true } });
      case 'manager':
        return await this.repository.count({ where: { isInstitutionManager: true } });
      default:
        return 0;
    }
  }

  async findActive(): Promise<Users[]> {
    return await this.repository.find({
      where: { 
        enabled: true,
        deleted: false,
        accountLocked: false 
      },
      relations: ['role', 'institution']
    });
  }

  async findInactive(): Promise<Users[]> {
    return await this.repository.find({
      where: [
        { enabled: false },
        { deleted: true },
        { accountLocked: true }
      ],
      relations: ['role', 'institution']
    });
  }
}
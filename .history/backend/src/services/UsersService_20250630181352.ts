import { DataSource } from 'typeorm';
import { UsersRepository } from '../repositories/UsersRepository';
import { Users } from '../entities/Users';
import { CreateUsersData, UpdateUsersData, UsersWithoutPassword } from '../models/Users';
import bcrypt from 'bcryptjs';

export class UsersService {
  private usersRepository: UsersRepository;

  constructor(dataSource: DataSource) {
    this.usersRepository = new UsersRepository(dataSource);
  }

  async getAllUsers(): Promise<UsersWithoutPassword[]> {
    return await this.usersRepository.findAll();
  }

  async getUserById(id: number): Promise<Users | null> {
    return await this.usersRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<Users | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async getUserByUsername(username: string): Promise<Users | null> {
    return await this.usersRepository.findByUsername(username);
  }

  async getUserByGoogleId(googleId: string): Promise<Users | null> {
    return await this.usersRepository.findByGoogleId(googleId);
  }

  async getUsersByRole(roleId: string): Promise<Users[]> {
    return await this.usersRepository.findByRole(roleId);
  }

  async getUsersByInstitution(institutionId: number): Promise<Users[]> {
    return await this.usersRepository.findByInstitution(institutionId);
  }

  async getAdmins(): Promise<Users[]> {
    return await this.usersRepository.findAdmins();
  }

  async getTeachers(): Promise<Users[]> {
    return await this.usersRepository.findTeachers();
  }

  async getStudents(): Promise<Users[]> {
    return await this.usersRepository.findStudents();
  }

  async getGuardians(): Promise<Users[]> {
    return await this.usersRepository.findGuardians();
  }

  async getCoordinators(): Promise<Users[]> {
    return await this.usersRepository.findCoordinators();
  }

  async getInstitutionManagers(): Promise<Users[]> {
    return await this.usersRepository.findInstitutionManagers();
  }

  async createUser(userData: CreateUsersData): Promise<Users> {
    // Validar email único
    const existingUserByEmail = await this.usersRepository.findByEmail(userData.email);
    if (existingUserByEmail) {
      throw new Error('Email já está em uso');
    }

    // Validar username único (se fornecido)
    if (userData.username) {
      const existingUserByUsername = await this.usersRepository.findByUsername(userData.username);
      if (existingUserByUsername) {
        throw new Error('Username já está em uso');
      }
    }

    // Validar GoogleId único (se fornecido)
    if (userData.googleId) {
      const existingUserByGoogleId = await this.usersRepository.findByGoogleId(userData.googleId);
      if (existingUserByGoogleId) {
        throw new Error('Google ID já está em uso');
      }
    }

    return await this.usersRepository.create(userData);
  }

  async updateUser(id: number, userData: UpdateUsersData): Promise<Users | null> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Validar email único (se sendo alterado)
    if (userData.email && userData.email !== existingUser.email) {
      const existingUserByEmail = await this.usersRepository.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('Email já está em uso');
      }
    }

    // Validar username único (se sendo alterado)
    if (userData.username && userData.username !== existingUser.username) {
      const existingUserByUsername = await this.usersRepository.findByUsername(userData.username);
      if (existingUserByUsername) {
        throw new Error('Username já está em uso');
      }
    }

    // Validar GoogleId único (se sendo alterado)
    if (userData.googleId && userData.googleId !== existingUser.googleId) {
      const existingUserByGoogleId = await this.usersRepository.findByGoogleId(userData.googleId);
      if (existingUserByGoogleId) {
        throw new Error('Google ID já está em uso');
      }
    }

    return await this.usersRepository.update(id, userData);
  }

  async deleteUser(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.delete(id);
  }

  async softDeleteUser(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.softDelete(id);
  }

  async activateUser(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.activate(id);
  }

  async deactivateUser(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.deactivate(id);
  }

  async resetUserPassword(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.resetPassword(id);
  }

  async updateUserPassword(id: number, newPassword: string): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return await this.usersRepository.updatePassword(id, hashedPassword);
  }

  async changeUserPassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar senha atual
    if (!existingUser.password) {
      throw new Error('Usuário não possui senha definida');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Hash da nova senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return await this.usersRepository.updatePassword(id, hashedPassword);
  }

  async lockUserAccount(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.lockAccount(id);
  }

  async unlockUserAccount(id: number): Promise<boolean> {
    const existingUser = await this.usersRepository.findById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado');
    }

    return await this.usersRepository.unlockAccount(id);
  }

  async authenticateUser(email: string, password: string): Promise<Users | null> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    // Verificar se a conta está ativa
    if (!user.enabled || user.deleted || user.accountLocked || user.accountExpired) {
      throw new Error('Conta inativa, bloqueada ou expirada');
    }

    // Verificar senha
    if (!user.password) {
      throw new Error('Usuário não possui senha definida');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserStats(): Promise<{
    total: number;
    admins: number;
    teachers: number;
    students: number;
    guardians: number;
    coordinators: number;
    managers: number;
  }> {
    const [total, admins, teachers, students, guardians, coordinators, managers] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.countByType('admin'),
      this.usersRepository.countByType('teacher'),
      this.usersRepository.countByType('student'),
      this.usersRepository.countByType('guardian'),
      this.usersRepository.countByType('coordinator'),
      this.usersRepository.countByType('manager')
    ]);

    return {
      total,
      admins,
      teachers,
      students,
      guardians,
      coordinators,
      managers
    };
  }

  async getActiveUsers(): Promise<Users[]> {
    return await this.usersRepository.findActive();
  }

  async getInactiveUsers(): Promise<Users[]> {
    return await this.usersRepository.findInactive();
  }

  // Métodos utilitários para criação de usuários específicos
  async createSystemAdmin(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: true,
      isManager: true,
      isStudent: false,
      isTeacher: false,
      isGuardian: false,
      isCoordinator: false,
      isInstitutionManager: false
    });
  }

  async createTeacher(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: false,
      isManager: false,
      isStudent: false,
      isTeacher: true,
      isGuardian: false,
      isCoordinator: false,
      isInstitutionManager: false
    });
  }

  async createStudent(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: false,
      isManager: false,
      isStudent: true,
      isTeacher: false,
      isGuardian: false,
      isCoordinator: false,
      isInstitutionManager: false
    });
  }

  async createGuardian(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: false,
      isManager: false,
      isStudent: false,
      isTeacher: false,
      isGuardian: true,
      isCoordinator: false,
      isInstitutionManager: false
    });
  }

  async createCoordinator(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: false,
      isManager: false,
      isStudent: false,
      isTeacher: false,
      isGuardian: false,
      isCoordinator: true,
      isInstitutionManager: false
    });
  }

  async createInstitutionManager(userData: Omit<CreateUsersData, 'isAdmin' | 'isManager' | 'isStudent' | 'isTeacher' | 'isGuardian' | 'isCoordinator' | 'isInstitutionManager'>): Promise<Users> {
    return await this.createUser({
      ...userData,
      isAdmin: false,
      isManager: true,
      isStudent: false,
      isTeacher: false,
      isGuardian: false,
      isCoordinator: false,
      isInstitutionManager: true
    });
  }
}
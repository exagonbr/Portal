import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { Role, UserRole } from '../entities/Role';
import { RoleRepository } from '../repositories/RoleRepository';
import { getJwtSecret } from '../config/jwt';

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public generateToken(user: User, role: Role): string {
    const payload: AuthTokenPayload = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: role.name,
      permissions: role.permissions,
      institutionId: user.institution_id,
    };

    return jwt.sign(payload, getJwtSecret(), {
      expiresIn: '1d',
    });
  }

  public async validateToken(token: string): Promise<AuthTokenPayload> {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded as AuthTokenPayload;
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
  public async createDefaultRoles(): Promise<void> {
    const roleRepository = new RoleRepository();
    const defaultRoles = Object.values(UserRole);

    for (const roleName of defaultRoles) {
      const existingRole = await roleRepository.findOne({ name: roleName } as any);
      if (!existingRole) {
        await roleRepository.createRole({
          name: roleName,
          description: `Default ${roleName} role`,
          permissions: Role.getDefaultPermissions(roleName as UserRole),
        } as any);
      }
    }
  }

  public async createDefaultAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await this.userRepository.findByEmail(adminEmail);

    if (!existingAdmin) {
      const roleRepository = new RoleRepository();
      const adminRole = await roleRepository.findOne({ name: UserRole.SYSTEM_ADMIN } as any);

      if (adminRole) {
        await this.userRepository.createUser({
          email: adminEmail,
          password: process.env.ADMIN_PASSWORD || 'password',
          full_name: 'Admin User',
          role_id: adminRole.id,
          institution_id: 'some-default-institution-id', // Substituir por um ID de instituição padrão, se aplicável
          is_active: true,
        });
      }
    }
  }
}

export default new AuthService();

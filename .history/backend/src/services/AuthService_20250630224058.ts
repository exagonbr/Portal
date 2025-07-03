import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { Role } from '../entities/Role'; // Keep for enum

class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public generateToken(user: User, role: Role): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      name: user.full_name,
      email: user.email,
      role: role.name,
      permissions: role.permissions,
      institutionId: user.institution_id,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });
  }

  public async validateToken(token: string): Promise<AuthTokenPayload> {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    return decoded as AuthTokenPayload;
  }

  public async getUserById(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }
}

export default new AuthService();

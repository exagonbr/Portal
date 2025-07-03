import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';
import { Role } from '../entities/Role';

class AuthService {
  public generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
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
    const userRepository = getCustomRepository(UserRepository);
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    return user;
  }
}

export default new AuthService();

import jwt from 'jsonwebtoken';
import { Users } from '../entities/Users';
import { getCustomRepository } from 'typeorm';
import { UserRepository } from '../repositories/UserRepository';
import { AuthTokenPayload } from '../types/express';

class AuthService {
  public generateToken(users: Users): string {
    const payload: AuthTokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
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

  public async getUserById(userId: string): Promise<User | undefined> {
    const userRepository = getCustomRepository(UserRepository);
    const user = await userRepository.findOne(userId, { relations: ['role'] });
    return user;
  }
}

export default new AuthService();

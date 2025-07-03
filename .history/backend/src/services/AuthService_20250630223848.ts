import jwt from 'jsonwebtoken';
import { User } from '../entities/User';

class AuthService {
  public generateToken(user: User): string {
    const payload = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });
  }
}

export default new AuthService();

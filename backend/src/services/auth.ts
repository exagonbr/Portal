import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development';
const JWT_EXPIRES_IN = '24h';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  institution_id: string;
}

interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  static async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(user: Partial<User>): string {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        institutionId: user.institution_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  static async register(userData: Partial<User>): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db('users')
      .where('email', userData.email)
      .first();

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password!);

    // Create new user
    const [user] = await db('users')
      .insert({
        ...userData,
        password: hashedPassword
      })
      .returning('*');

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await db('users')
      .where('email', email)
      .first();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.comparePasswords(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

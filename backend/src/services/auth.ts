import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'ExagonTech';
const JWT_EXPIRES_IN = '24h';

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
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

  static async generateToken(user: Partial<User>, roleName: string, permissions: string[]): Promise<string> {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            name: user.name,
            role: roleName,
            permissions: permissions,
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

    // Buscar a role do usuário pelo role_id
    const role = await db('roles')
      .where('id', user.role_id)
      .first();
    
    let permissions: string[] = [];
    let roleName = '';
    
    // Se encontrou a role, buscar as permissões associadas
    if (role) {
      roleName = role.name;
      
      // Buscar as permissões da role através da tabela de junção
      const rolePermissions = await db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('role_permissions.role_id', role.id)
        .select('permissions.name');
      
      permissions = rolePermissions.map(p => p.name);
    }

    // Generate token
    const token = await this.generateToken(user, roleName, permissions);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Adicionar as permissões e role name à resposta do usuário
    const userWithPermissions = {
      ...userWithoutPassword,
      role: roleName,
      permissions
    };

    return {
      token,
      user: userWithPermissions
    };
  }

  static async validateUser(email: string, password?: string) {
    const user = await db('users').where('email', email).first();
    if (!user) {
        throw new Error('User not found');
    }
    if (password) {
        const isValidPassword = await this.comparePasswords(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
    }
    return user;
}

  static async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.validateUser(email, password);

    const { roleName, permissions } = await this.getRoleAndPermissions(user.role_id);

    // Generate token
    const token = await this.generateToken(user, roleName, permissions);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Adicionar as permissões e role name à resposta do usuário
    const userWithPermissions = {
      ...userWithoutPassword,
      role: roleName,
      permissions,
      institution_id: user.institution_id
    };

    return {
      token,
      user: userWithPermissions
    };
  }

  static async getRoleAndPermissions(roleId: string | null) {
    if (!roleId) {
        return { roleName: 'user', permissions: [] };
    }

    const role = await db('roles').where('id', roleId).first();
    if (!role) {
        return { roleName: 'user', permissions: [] };
    }

    const rolePermissions = await db('role_permissions')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('role_permissions.role_id', role.id)
        .select('permissions.name');

    const permissions = rolePermissions.map(p => p.name);
    return { roleName: role.name, permissions };
}

  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      return null;
    }

    const { roleName, permissions } = await this.getRoleAndPermissions(user.role_id);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Adicionar as permissões e role name à resposta do usuário
    const userWithPermissions = {
      ...userWithoutPassword,
      role: roleName,
      permissions
    };
    
    return userWithPermissions;
  }
}

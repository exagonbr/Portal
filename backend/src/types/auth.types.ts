export interface LegacyAuthTokenPayload {
  id: string;
  email: string;
  name: string;
  roleId: string;
  institutionId?: string;
  schoolId?: string;
  isActive: boolean;
}

export interface LegacyUser extends LegacyAuthTokenPayload {
  createdAt: Date;
  updatedAt: Date;
}

// Define role types
export type UserRole = 'admin' | 'teacher' | 'student' | 'manager';

// Define permission types
export type Permission = {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
};

/**
 * Interface para o usuário autenticado, que será anexada ao objeto `req`.
 * Esta é a fonte da verdade para o tipo de usuário em toda a aplicação.
 */
export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institutionId?: number;
  sessionId?: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  name: string;
  roleId: string;
  institutionId?: string;
  schoolId?: string;
  isActive: boolean;
}

export interface User extends AuthTokenPayload {
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

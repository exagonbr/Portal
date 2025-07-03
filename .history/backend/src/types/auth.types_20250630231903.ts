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

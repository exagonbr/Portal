import { Role } from '../entities/Role';

export interface User {
  id: number;
  googleId?: string;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  dateCreated?: Date;
  deleted?: boolean;
  email: string;
  enabled?: boolean;
  fullName: string;
  invitationSent?: boolean;
  isAdmin: boolean;
  language?: string;
  lastUpdated?: Date;
  password?: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  resetPassword?: boolean;
  username?: string;
  uuid?: string;
  isManager: boolean;
  type?: number;
  certificatePath?: string;
  isCertified?: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  institutionId?: number;
  subject?: string;
  subjectDataId?: number;
  role?: Role;
}

export interface CreateUserData {
  email: string;
  fullName: string;
  password?: string;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  institutionId?: number;
  enabled?: boolean;
  googleId?: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  password?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  institutionId?: number;
  enabled?: boolean;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  phone?: string;
  language?: string;
  deleted?: boolean;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}
export interface Users {
  id: number;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  dateCreated: Date;
  deleted?: boolean;
  email: string;
  enabled?: boolean;
  fullName: string;
  invitationSent?: boolean;
  isAdmin: boolean;
  language?: string;
  lastUpdated: Date;
  password?: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  resetPassword: boolean;
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
  isInstitutionManage?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  googleId?: string;
}

export interface CreateUsersData {
  email: string;
  fullName: string;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  resetPassword?: boolean;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  deleted?: boolean;
  enabled?: boolean;
  invitationSent?: boolean;
  language?: string;
  password?: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  username?: string;
  uuid?: string;
  type?: number;
  certificatePath?: string;
  isCertified?: boolean;
  institutionId?: number;
  subject?: string;
  subjectDataId?: number;
  isInstitutionManage?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  googleId?: string;
}

export interface UpdateUsersData {
  email?: string;
  fullName?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  resetPassword?: boolean;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  deleted?: boolean;
  enabled?: boolean;
  invitationSent?: boolean;
  language?: string;
  password?: string;
  passwordExpired?: boolean;
  pauseVideoOnClick?: boolean;
  phone?: string;
  username?: string;
  uuid?: string;
  type?: number;
  certificatePath?: string;
  isCertified?: boolean;
  institutionId?: number;
  subject?: string;
  subjectDataId?: number;
  isInstitutionManage?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  googleId?: string;
}

export interface UsersWithoutPassword extends Omit<Users, 'password'> {}

// Tipos específicos para diferentes tipos de usuários
export interface SystemAdminUser extends Users {
  isAdmin: true;
  isManager: true;
  isStudent: false;
  isTeacher: false;
  isGuardian: false;
  isCoordinator: false;
  isInstitutionManager: false;
}

export interface GuardianUser extends Users {
  isAdmin: false;
  isManager: false;
  isStudent: false;
  isTeacher: false;
  isGuardian: true;
  isCoordinator: false;
  isInstitutionManager: false;
}

export interface TeacherUser extends Users {
  isAdmin: false;
  isManager: false;
  isStudent: false;
  isTeacher: true;
  isGuardian: false;
  isCoordinator: false;
  isInstitutionManager: false;
}

export interface StudentUser extends Users {
  isAdmin: false;
  isManager: false;
  isStudent: true;
  isTeacher: false;
  isGuardian: false;
  isCoordinator: false;
  isInstitutionManager: false;
}

export interface CoordinatorUser extends Users {
  isAdmin: false;
  isManager: false;
  isStudent: false;
  isTeacher: false;
  isGuardian: false;
  isCoordinator: true;
  isInstitutionManager: false;
}

export interface InstitutionManagerUser extends Users {
  isAdmin: false;
  isManager: true;
  isStudent: false;
  isTeacher: false;
  isGuardian: false;
  isCoordinator: false;
  isInstitutionManager: true;
}
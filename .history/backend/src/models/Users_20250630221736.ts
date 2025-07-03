export interface Users {
  id: number;
  version?: number;
  accountExpired?: boolean;
  accountLocked?: boolean;
  address?: string;
  amountOfMediaEntries?: number;
  dateCreated: string;
  deleted?: boolean;
  email: string;
  enabled?: boolean;
  fullName: string;
  invitationSent?: boolean;
  isAdmin: boolean;
  language?: string;
  lastUpdated: string;
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
  // Campos de compatibilidade com o frontend atual
  name: string; // Mapeado de fullName
  role_id?: string; // Mapeado de roleId
  institution_id?: number; // Mapeado de institutionId
  is_active: boolean; // Mapeado de enabled
  created_at: string; // Mapeado de dateCreated
  updated_at: string; // Mapeado de lastUpdated
  telefone?: string; // Mapeado de phone
  endereco?: string; // Mapeado de address
}

export interface CreateUsersData {
  email: string;
  fullName: string;
  password?: string;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  resetPassword?: boolean;
  address?: string;
  phone?: string;
  username?: string;
  language?: string;
  googleId?: string;
}

export interface UpdateUsersData {
  email?: string;
  fullName?: string;
  password?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  resetPassword?: boolean;
  address?: string;
  phone?: string;
  username?: string;
  language?: string;
  deleted?: boolean;
  accountLocked?: boolean;
  accountExpired?: boolean;
}

export interface UsersWithoutPassword extends Omit<Users, 'password'> {}

export interface UsersFilterData {
  search?: string;
  name?: string;
  email?: string;
  role?: string;
  role_id?: string;
  roleId?: string;
  institution_id?: number;
  institutionId?: number;
  is_active?: boolean;
  enabled?: boolean;
  isAdmin?: boolean;
  isTeacher?: boolean;
  isStudent?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'fullName' | 'email' | 'dateCreated' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersListResult {
  items: Users[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
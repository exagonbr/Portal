import { 
  BaseEntity, 
  BaseEntityDto, 
  UserRole, 
  ContactInfo, 
  BaseFilter,
  UUID,
  DateString,
  Phone,
  Email
} from './common';

export interface User extends BaseEntity {
  name: string;
  email: Email;
  cpf?: string;
  phone?: Phone;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados (deprecated - usar ContactInfo)
  /** @deprecated Use phone instead */
  telefone?: Phone;
  /** @deprecated Use address instead */
  endereco?: string;
  
  role_id: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active: boolean;
}

export interface UserDto extends BaseEntityDto {
  name: string;
  email: Email;
  cpf?: string;
  phone?: Phone;
  birth_date?: DateString;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados (deprecated)
  /** @deprecated Use phone instead */
  telefone?: Phone;
  /** @deprecated Use address instead */
  endereco?: string;
  
  role_id: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active: boolean;
}

export interface CreateUserDto {
  name: string;
  email: Email;
  password: string;
  cpf?: string;
  phone?: Phone;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados (deprecated)
  /** @deprecated Use phone instead */
  telefone?: Phone;
  /** @deprecated Use address instead */
  endereco?: string;
  
  role_id: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: Email;
  password?: string;
  cpf?: string;
  phone?: Phone;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados (deprecated)
  /** @deprecated Use phone instead */
  telefone?: Phone;
  /** @deprecated Use address instead */
  endereco?: string;
  
  role_id?: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active?: boolean;
}

export interface UserWithRole extends User {
  role: {
    id: UUID;
    name: string;
    description?: string;
  };
}

export interface UserFilter extends BaseFilter {
  role_id?: UUID;
  institution_id?: UUID;
  sortBy?: 'name' | 'email' | 'created_at' | 'updated_at';
}

export interface UserLoginData {
  email: Email;
  password: string;
}

export interface UserLoginResponse {
  user: UserWithRole;
  token: string;
  refreshToken?: string;
}

export interface UserProfile extends User {
  role: {
    id: UUID;
    name: string;
    permissions: string[];
  };
  institution?: {
    id: UUID;
    name: string;
    code: string;
  };
  schools?: Array<{
    id: UUID;
    name: string;
    code: string;
    position?: string;
  }>;
  classes?: Array<{
    id: UUID;
    name: string;
    code: string;
    role: string;
  }>;
}

export interface ProfileDto {
  id: UUID;
  user_id: UUID;
  name: string;
  language?: string;
  avatar_color?: string;
  is_child?: boolean;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export const USER_STATUS_LABELS: Record<string, string> = {
  'true': 'Ativo',
  'false': 'Inativo'
};

export const USER_STATUS_COLORS: Record<string, string> = {
  'true': 'green',
  'false': 'red'
};

// ===== UTILITÁRIOS DE MIGRAÇÃO =====

/**
 * Converte campos legados para novos campos padronizados
 */
export const migrateUserFields = (user: any): User => {
  return {
    ...user,
    phone: user.phone || user.telefone,
    address: user.address || user.endereco,
    // Remove campos legados após migração
    telefone: undefined,
    endereco: undefined
  };
};

/**
 * Mantém compatibilidade com campos legados
 */
export const ensureBackwardCompatibility = (user: User): User & { telefone?: Phone; endereco?: string } => {
  return {
    ...user,
    telefone: user.telefone || user.phone,
    endereco: user.endereco || user.address
  };
};
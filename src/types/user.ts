export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  role_id: string;
  institution_id?: string;
  school_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  role_id: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  role_id?: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UserWithRole extends User {
  role: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface UserFilter {
  search?: string;
  role_id?: string;
  institution_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof User;
  sortOrder?: 'asc' | 'desc';
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserLoginResponse {
  user: UserWithRole;
  token: string;
  refreshToken?: string;
}

export interface UserProfile extends User {
  role: {
    id: string;
    name: string;
    permissions: string[];
  };
  institution?: {
    id: string;
    name: string;
    code: string;
  };
  schools?: Array<{
    id: string;
    name: string;
    code: string;
    position?: string;
  }>;
  classes?: Array<{
    id: string;
    name: string;
    code: string;
    role: string;
  }>;
}

export const USER_STATUS_LABELS: Record<string, string> = {
  'true': 'Ativo',
  'false': 'Inativo'
};

export const USER_STATUS_COLORS: Record<string, string> = {
  'true': 'green',
  'false': 'red'
};
// Entidade User refatorada para PostgreSQL
export interface User {
  id: number;
  version?: number;
  email: string;
  password: string;
  name: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  is_active: boolean;
  role_id?: number;
  institution_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  is_active?: boolean;
  role_id?: number;
  institution_id?: number;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  is_active?: boolean;
  role_id?: number;
  institution_id?: number;
}

export interface UserWithRelations extends User {
  role?: {
    id: number;
    name: string;
    permissions?: string[];
  };
  institution?: {
    id: number;
    name: string;
  };
}
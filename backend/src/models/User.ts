export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role_id?: string; // Agora opcional, será definido para TEACHER por padrão
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  role_id?: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

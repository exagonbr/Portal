export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active: boolean;
  cpf?: string;
  birth_date?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active?: boolean;
  cpf?: string;
  birth_date?: string;
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
  cpf?: string;
  birth_date?: string;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

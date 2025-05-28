export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id: string;
  endereco?: string;
  telefone?: string;
  usuario: string;
  unidade_ensino?: string;
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
  usuario: string;
  unidade_ensino?: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  name?: string;
  role_id?: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

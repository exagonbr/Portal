import { Institution } from "../entities/Institution";
import { Role } from "../entities/Role";

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role_id: number;
  institution_id?: number;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role_id?: number;
  institution_id?: number;
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  sessionId?: string;
  expires_at: string;
}

export interface UserResponseDto {
  id: number;
  email: string;
  name: string;
  role?: {
    id: number;
    name: string;
    permissions?: string[];
  };
  institution?: {
    id: number;
    name: string;
  };
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidade_ensino?: string;
  cpf?: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
export type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean; // Adicionado campo is_active
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstitutionData {
  name: string;
  code: string;
  type: InstitutionType;
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean; // Adicionado
}

export interface UpdateInstitutionData {
  name?: string;
  code?: string;
  type?: InstitutionType;
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean; // Adicionado
}

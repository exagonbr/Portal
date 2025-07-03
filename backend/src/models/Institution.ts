export type InstitutionType = 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';

export interface Institution {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active: boolean; // Adicionado campo is_active
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstitutionData {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active?: boolean; // Adicionado
}

export interface UpdateInstitutionData {
  name?: string;
  code?: string;
  type?: InstitutionType;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  is_active?: boolean; // Adicionado
}

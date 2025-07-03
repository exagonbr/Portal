export interface School {
  id: string;
  name: string;
  code: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSchoolData {
  name: string;
  code: string;
  institution_id: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateSchoolData {
  name?: string;
  code?: string;
  institution_id?: string;
  type?: 'elementary' | 'middle' | 'high' | 'technical';
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}
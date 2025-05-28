export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstitutionData {
  name: string;
  code: string;
  type: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateInstitutionData {
  name?: string;
  code?: string;
  type?: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
  characteristics?: string;
  address?: string;
  phone?: string;
  email?: string;
}

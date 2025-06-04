import { InstitutionType } from '@/types/institution';

export interface Unit {
  id: string;
  name: string;
}

export interface InstitutionDisplayData {
  id: string;
  name: string;
  location: string;
  status: 'Ativa' | 'Inativa' | 'Pendente';
  imageUrl?: string;
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  unitCount: number;
  type: InstitutionType;
  address?: string;
  units?: Unit[];
}

export interface FilterState {
  searchTerm: string;
  type: string;
  status: string;
  sortBy: string;
} 
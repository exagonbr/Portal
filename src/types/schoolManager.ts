export type ManagerPosition = 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'COORDINATOR' | 'SUPERVISOR';

export interface SchoolManager {
  id: string;
  user_id: string;
  school_id: string;
  position: ManagerPosition;
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSchoolManagerData {
  user_id: string;
  school_id: string;
  position: ManagerPosition;
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
}

export interface UpdateSchoolManagerData {
  user_id?: string;
  school_id?: string;
  position?: ManagerPosition;
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
}

export interface SchoolManagerWithDetails extends SchoolManager {
  user_name: string;
  user_email: string;
  school_name: string;
  school_code: string;
  institution_name: string;
  institution_id: string;
}

export interface SchoolManagementTeam {
  school_id: string;
  school_name: string;
  managers: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    position: ManagerPosition;
    start_date: Date;
    end_date?: Date;
    is_active: boolean;
  }>;
  principal?: SchoolManagerWithDetails;
  vice_principals: SchoolManagerWithDetails[];
  coordinators: SchoolManagerWithDetails[];
  supervisors: SchoolManagerWithDetails[];
}

export interface ManagerHistory {
  user_id: string;
  user_name: string;
  positions: Array<{
    school_id: string;
    school_name: string;
    institution_name: string;
    position: ManagerPosition;
    start_date: Date;
    end_date?: Date;
    is_active: boolean;
  }>;
}

export interface SchoolManagerFilter {
  user_id?: string;
  school_id?: string;
  position?: ManagerPosition;
  is_active?: boolean;
  institution_id?: string;
  page?: number;
  limit?: number;
  sortBy?: keyof SchoolManager;
  sortOrder?: 'asc' | 'desc';
}

export const MANAGER_POSITION_LABELS: Record<ManagerPosition, string> = {
  PRINCIPAL: 'Diretor(a)',
  VICE_PRINCIPAL: 'Vice-Diretor(a)',
  COORDINATOR: 'Coordenador(a)',
  SUPERVISOR: 'Supervisor(a)'
};

export const MANAGER_POSITION_COLORS: Record<ManagerPosition, string> = {
  PRINCIPAL: '#9C27B0',
  VICE_PRINCIPAL: '#673AB7',
  COORDINATOR: '#3F51B5',
  SUPERVISOR: '#2196F3'
};

export const MANAGER_POSITION_HIERARCHY: Record<ManagerPosition, number> = {
  PRINCIPAL: 1,
  VICE_PRINCIPAL: 2,
  COORDINATOR: 3,
  SUPERVISOR: 4
};
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
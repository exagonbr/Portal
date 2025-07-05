export enum ManagerPosition {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

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
  user_name?: string;
  user_email?: string;
  school_name?: string;
  school_code?: string;
  institution_name?: string;
  institution_id?: string;
}

export interface CreateSchoolManagerData {
  user_id: string;
  school_id: string;
  position: ManagerPosition;
  start_date?: Date;
  is_active?: boolean;
}

export interface UpdateSchoolManagerData {
  position?: ManagerPosition;
  end_date?: Date;
  is_active?: boolean;
}
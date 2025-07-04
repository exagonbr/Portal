export enum UserClassRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  COORDINATOR = 'COORDINATOR'
}

export interface UserClass {
  id: string;
  user_id: string;
  class_id: string;
  role: UserClassRole;
  enrollment_date: Date;
  exit_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  user_name?: string;
  user_email?: string;
  class_name?: string;
  class_code?: string;
  school_name?: string;
  school_id?: string;
}

export interface CreateUserClassData {
  user_id: string;
  class_id: string;
  role: UserClassRole;
  enrollment_date?: Date;
  is_active?: boolean;
}

export interface UpdateUserClassData {
  role?: UserClassRole;
  exit_date?: Date;
  is_active?: boolean;
}
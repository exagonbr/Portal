export type UserClassRole = 'STUDENT' | 'TEACHER' | 'COORDINATOR';

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
}

export interface CreateUserClassData {
  user_id: string;
  class_id: string;
  role: UserClassRole;
  enrollment_date?: Date;
  exit_date?: Date;
  is_active?: boolean;
}

export interface UpdateUserClassData {
  user_id?: string;
  class_id?: string;
  role?: UserClassRole;
  enrollment_date?: Date;
  exit_date?: Date;
  is_active?: boolean;
}
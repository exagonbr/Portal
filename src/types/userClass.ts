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

export interface UserClassWithDetails extends UserClass {
  user_name: string;
  user_email: string;
  class_name: string;
  class_code: string;
  school_name: string;
  school_id: string;
}

export interface ClassEnrollmentSummary {
  class_id: string;
  class_name: string;
  total_students: number;
  total_teachers: number;
  total_coordinators: number;
  active_enrollments: number;
  inactive_enrollments: number;
}

export interface UserEnrollmentHistory {
  user_id: string;
  user_name: string;
  enrollments: Array<{
    class_id: string;
    class_name: string;
    school_name: string;
    role: UserClassRole;
    enrollment_date: Date;
    exit_date?: Date;
    is_active: boolean;
  }>;
}

export interface UserClassFilter {
  user_id?: string;
  class_id?: string;
  role?: UserClassRole;
  is_active?: boolean;
  school_id?: string;
  year?: number;
  page?: number;
  limit?: number;
  sortBy?: keyof UserClass;
  sortOrder?: 'asc' | 'desc';
}

export const USER_CLASS_ROLE_LABELS: Record<UserClassRole, string> = {
  STUDENT: 'Aluno',
  TEACHER: 'Professor',
  COORDINATOR: 'Coordenador'
};

export const USER_CLASS_ROLE_COLORS: Record<UserClassRole, string> = {
  STUDENT: '#4CAF50',
  TEACHER: '#2196F3',
  COORDINATOR: '#FF9800'
};
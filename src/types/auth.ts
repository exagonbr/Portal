export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  courses?: any[];
}

export interface AuthResponse {
  user: User;
  token?: string;
}

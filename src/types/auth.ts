export type UserRole = 'admin' | 'teacher' | 'student' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  type?: string; // For backward compatibility
  courses?: any[];
}

export interface AuthResponse {
  user: User;
  token?: string;
}

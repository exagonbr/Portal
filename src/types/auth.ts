export type UserRole = 'admin' | 'teacher' | 'student' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  type?: string; // For backward compatibility
  institution?: string; // Added for institution chart
  courses?: any[];
  endereco?: string;
  telefone?: string;
  usuario?: string;
  senha?: string; // Note: Storing passwords client-side is insecure
  unidadeEnsino?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
}

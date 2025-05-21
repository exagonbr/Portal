export interface User {
  id: string;
  name: string;
  email: string;
  type: 'student' | 'teacher';
  courses?: string[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<void>;
}

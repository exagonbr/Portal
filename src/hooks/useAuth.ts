import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aqui você implementaria a lógica real de autenticação
    // Por enquanto, apenas simulamos um usuário logado
    const checkAuth = async () => {
      try {
        // Simular verificação de autenticação
        const userFromStorage = localStorage.getItem('user');
        
        if (userFromStorage) {
          setUser(JSON.parse(userFromStorage));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    // Simular login
    const mockUser = {
      id: 1,
      name: 'Usuário Teste',
      email,
      role: 'student'
    };

    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
} 
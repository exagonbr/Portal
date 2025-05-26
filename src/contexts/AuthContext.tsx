'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types/auth';
import * as authService from '../services/auth';
import { useRouter } from 'next/navigation';
import { LoginResponse, RegisterResponse } from '../services/auth';
import { useSession } from 'next-auth/react';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => Promise<LoginResponse>;
  register: (name: string, email: string, password: string, type: 'student' | 'teacher') => Promise<RegisterResponse>;
  logout: () => void;
  listUsers: () => Promise<User[]>;
  createUser: (userData: Omit<User, 'id'>) => Promise<User>;
  updateUser: (id: string, userData: Partial<User>) => Promise<User | null>;
  deleteUser: (id: string) => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  listUsers: async () => [],
  createUser: async () => ({ id: '', name: '', email: '', role: 'student' }),
  updateUser: async () => null,
  deleteUser: async () => false
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    checkAuth();
  }, [session]); // Re-run when session changes

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUser(user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await authService.login(email, password);
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        throw new Error('Login failed: Invalid response from server');
      }

      return response;
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'An error occurred during login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher'): Promise<RegisterResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.register(name, email, password, type);
      
      if (response.success && response.user) {
        setUser(response.user);
      } else {
        throw new Error('Registration failed: Invalid response from server');
      }

      return response;
    } catch (error: any) {
      console.error('Registration failed:', error);
      setError(error.message || 'An error occurred during registration');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout().then(() => {
      setUser(null);
      router.push('/login');
    }).catch((error) => {
      console.error('Logout failed:', error);
    });
  };

  const listUsers = async () => {
    try {
      return await authService.listUsers();
    } catch (error) {
      console.error('Failed to list users:', error);
      throw error;
    }
  };

  const createUser = async (userData: Omit<User, 'id'>) => {
    try {
      return await authService.createUser(userData);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      return await authService.updateUser(id, userData);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      return await authService.deleteUser(id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      setUser, 
      login, 
      register, 
      logout,
      listUsers,
      createUser,
      updateUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { authService } from '../services/auth'
import { User, AuthContextType } from '../types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const user = await authService.getCurrentUser()
      if (user) {
        setUser(user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setError('Authentication check failed')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const user = await authService.login({ email, password })
      setUser(user)
    } catch (error) {
      console.error('Login failed:', error)
      setError('Login failed. Please check your credentials.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
      setError('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, type: 'student' | 'teacher') => {
    try {
      setLoading(true)
      setError(null)
      const user = await authService.register(name, email, password, type)
      setUser(user)
    } catch (error) {
      console.error('Registration failed:', error)
      setError('Registration failed. Please try again.')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

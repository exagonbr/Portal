interface User {
  id: string
  name: string
  email: string
  type: 'student' | 'teacher'
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  type: 'student' | 'teacher'
}

class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(credentials: LoginCredentials): Promise<User> {
    // In a real app, this would make an API call
    // For demo purposes, we'll simulate a successful login
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          id: '1',
          name: 'João Silva',
          email: credentials.email,
          type: 'student'
        }
        // Store token in localStorage
        localStorage.setItem('auth_token', 'demo_token')
        resolve(this.currentUser)
      }, 1000)
    })
  }

  async register(data: RegisterData): Promise<User> {
    // In a real app, this would make an API call
    // For demo purposes, we'll simulate a successful registration
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          id: '1',
          name: data.name,
          email: data.email,
          type: data.type
        }
        // Store token in localStorage
        localStorage.setItem('auth_token', 'demo_token')
        resolve(this.currentUser)
      }, 1000)
    })
  }

  async logout(): Promise<void> {
    // In a real app, this would make an API call to invalidate the token
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = null
        localStorage.removeItem('auth_token')
        resolve()
      }, 500)
    })
  }

  async getCurrentUser(): Promise<User | null> {
    // In a real app, this would validate the token and get user data
    if (this.currentUser) {
      return this.currentUser
    }

    const token = localStorage.getItem('auth_token')
    if (!token) {
      return null
    }

    // Simulate fetching user data with token
    return new Promise((resolve) => {
      setTimeout(() => {
        this.currentUser = {
          id: '1',
          name: 'João Silva',
          email: 'joao@example.com',
          type: 'student'
        }
        resolve(this.currentUser)
      }, 500)
    })
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  }
}

export const authService = AuthService.getInstance()

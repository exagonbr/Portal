import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'SYSTEM_ADMIN' | 'INSTITUTION_MANAGER' | 'COORDINATOR' | 'TEACHER' | 'STUDENT' | 'GUARDIAN'
      institution_id?: string
      school_id?: string
      dependents?: string[]
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: 'SYSTEM_ADMIN' | 'INSTITUTION_MANAGER' | 'COORDINATOR' | 'TEACHER' | 'STUDENT' | 'GUARDIAN'
    institution_id?: string
    school_id?: string
    dependents?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'SYSTEM_ADMIN' | 'INSTITUTION_MANAGER' | 'COORDINATOR' | 'TEACHER' | 'STUDENT' | 'GUARDIAN'
    institution_id?: string
    school_id?: string
    dependents?: string[]
  }
} 
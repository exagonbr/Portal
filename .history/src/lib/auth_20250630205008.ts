import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Fazer requisição para o backend de autenticação
          const backendUrl = process.env.FORCE_PRODUCTION_BACKEND === 'true'
            ? 'https://portal.sabercon.com.br/api'
            : 'http://localhost:3001/api';
          
          const response = await fetch(`${backendUrl}/auth/optimized/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          
          if (data.success && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              permissions: data.user.permissions || [],
            };
          }
          
          return null;
        } catch (error) {
          console.error('Erro na autenticação:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.role = 'STUDENT'; // Default role for Google login
        // Adicionar permissões padrão para estudantes
        token.permissions = [
          'students.communicate',
          'schedule.view.own',
          'grades.view.own',
          'materials.access',
          'assignments.submit',
          'progress.track.own',
          'teachers.message',
          'announcements.receive'
        ];
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas (86400 segundos)
    updateAge: 24 * 60 * 60, // Atualizar a cada 24 horas
  }
} 
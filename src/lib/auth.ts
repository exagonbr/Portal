import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getInternalApiUrl } from '@/config/urls';

// Estender os tipos do NextAuth para incluir role e permissions
declare module 'next-auth' {
  interface User {
    role?: string;
    permissions?: string[];
  }
}

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
          const response = await fetch(getInternalApiUrl('/auth/login'), {
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
          
          if (data.success && data.data && data.data.user) {
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: data.data.user.role.toUpperCase() || 'STUDENT',
              permissions: data.data.user.permissions || [],
            };
          }
          
          return null;
        } catch (error) {
          console.log('Erro na autenticação:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para login com Google, verificar/criar usuário no backend
      if (account?.provider === 'google') {
        try {
          const response = await fetch(getInternalApiUrl('/auth/google-signin'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              googleId: user.id,
              image: user.image,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.user) {
              // Adicionar informações do backend ao usuário
              user.role = data.data.user.role?.toUpperCase() || 'STUDENT';
              user.permissions = data.data.user.permissions || [];
              user.id = data.data.user.id;
              return true;
            }
          }
          
          // Se não conseguir criar/buscar no backend, ainda permitir login
          // mas com role padrão
          user.role = 'STUDENT';
          user.permissions = [
            'students.communicate',
            'schedule.view.own',
            'grades.view.own',
            'materials.access',
            'assignments.submit',
            'progress.track.own',
            'teachers.message',
            'announcements.receive'
          ];
          return true;
        } catch (error) {
          console.error('Erro ao processar login do Google:', error);
          // Ainda permitir login mesmo com erro
          user.role = 'STUDENT';
          user.permissions = [];
          return true;
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.role = user.role?.toUpperCase() || 'STUDENT';
        token.permissions = user.permissions || [
          'students.communicate',
          'schedule.view.own',
          'grades.view.own',
          'materials.access',
          'assignments.submit',
          'progress.track.own',
          'teachers.message',
          'announcements.receive'
        ];
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
    updateAge: 24 * 60 * 60, // Atualizar a cada 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
} 
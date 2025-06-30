import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
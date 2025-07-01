import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// Debug function para verificar configuração
export function debugAuthConfig() {
  console.log('🔍 [AUTH-DEBUG] Verificando configuração de autenticação...');
  
  const config = {
    googleClientId: !!process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
    googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
    googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
    googleClientIdPreview: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
    googleClientSecretPreview: process.env.GOOGLE_CLIENT_SECRET?.substring(0, 20) + '...',
    areGoogleCredentialsEqual: process.env.GOOGLE_CLIENT_ID === process.env.GOOGLE_CLIENT_SECRET
  };
  
  console.log('🔍 [AUTH-DEBUG] Configuração:', config);
  
  // Verificar se CLIENT_ID e CLIENT_SECRET são iguais (erro comum)
  if (config.areGoogleCredentialsEqual) {
    console.log('❌ [AUTH-DEBUG] ERRO: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET são iguais!');
    console.log('❌ [AUTH-DEBUG] Isso causará falha na autenticação Google OAuth');
  }
  
  return config;
}

// Configuração de autenticação melhorada com debug
export const authOptionsDebug: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    // Adicionar provider de credenciais como fallback
    CredentialsProvider({
      id: 'credentials',
      name: 'Credenciais',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH-DEBUG] Tentativa de login com credenciais:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH-DEBUG] Credenciais incompletas');
          return null;
        }
        
        try {
          // Fazer requisição para o backend de autenticação
          const backendUrl = process.env.FORCE_PRODUCTION_BACKEND === 'true'
            ? 'https://portal.sabercon.com.br/api'
            : 'https://portal.sabercon.com.br/api';
          
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
            console.log('❌ [AUTH-DEBUG] Resposta do backend não OK:', response.status);
            return null;
          }

          const data = await response.json();
          console.log('🔍 [AUTH-DEBUG] Resposta do backend:', data);
          
          if (data.success && data.data && data.data.user) {
            console.log('✅ [AUTH-DEBUG] Login bem-sucedido:', data.data.user.email);
            return {
              id: data.data.user.id,
              email: data.data.user.email,
              name: data.data.user.name,
              role: data.data.user.role,
              permissions: data.data.user.permissions || [],
            };
          }
          
          console.log('❌ [AUTH-DEBUG] Dados inválidos na resposta');
          return null;
        } catch (error) {
          console.log('❌ [AUTH-DEBUG] Erro na autenticação:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user: any; account: any }) {
      console.log('🔍 [AUTH-DEBUG] JWT Callback:', {
        hasUser: !!user,
        hasAccount: !!account,
        provider: account?.provider,
        tokenRole: token.role
      });
      
      if (user) {
        token.role = user.role || 'STUDENT';
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
        
        console.log('✅ [AUTH-DEBUG] Token atualizado:', {
          userId: token.sub,
          email: token.email,
          role: token.role,
          permissionsCount: Array.isArray(token.permissions) ? token.permissions.length : 0
        });
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('🔍 [AUTH-DEBUG] Session Callback:', {
        hasSession: !!session,
        hasUser: !!session.user,
        tokenRole: token.role
      });
      
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).permissions = token.permissions;
        
        console.log('✅ [AUTH-DEBUG] Sessão criada:', {
          userId: session.user.email,
          role: (session.user as any).role,
          permissionsCount: Array.isArray((session.user as any).permissions) ? (session.user as any).permissions.length : 0
        });
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log('🔍 [AUTH-DEBUG] SignIn Callback:', {
        provider: account?.provider,
        userEmail: user?.email,
        hasProfile: !!profile
      });
      
      // Permitir login sempre para debug
      return true;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=auth_error'
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 [AUTH-DEBUG] SignIn Event:', {
        provider: account?.provider,
        userEmail: user?.email,
        isNewUser
      });
    },
    async signOut({ session, token }) {
      console.log('👋 [AUTH-DEBUG] SignOut Event:', {
        userEmail: session?.user?.email || token?.email
      });
    },
    async session({ session, token }) {
      console.log('🔄 [AUTH-DEBUG] Session Event:', {
        userEmail: session?.user?.email,
        role: (session?.user as any)?.role
      });
    }
  }
};

// Função para testar sessão
export async function testSession() {
  console.log('🧪 [AUTH-DEBUG] Testando configuração de sessão...');
  
  try {
    const { getServerSession } = await import('next-auth');
    const session = await getServerSession(authOptionsDebug);
    
    console.log('🧪 [AUTH-DEBUG] Resultado do teste de sessão:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      userRole: (session?.user as any)?.role,
      permissionsCount: Array.isArray((session?.user as any)?.permissions) ? (session?.user as any).permissions.length : 0
    });
    
    return session;
  } catch (error) {
    console.log('❌ [AUTH-DEBUG] Erro ao testar sessão:', error);
    return null;
  }
}
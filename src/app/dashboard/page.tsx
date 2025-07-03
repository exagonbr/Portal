'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { getDefaultDashboard } from '@/utils/rolePermissions';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      try {
        if (!user) {
          setRedirecting(true);
          router.push('/login?error=unauthorized');
          return;
        }

        // Usar o utilitário para obter o dashboard padrão
        const userRole = user.role as UserRole;
        
        if (!userRole) {
          setError('Perfil de usuário não identificado. Por favor, faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const defaultRoute = getDefaultDashboard(userRole);
        
        if (!defaultRoute) {
          setError('Erro interno: dashboard não encontrado para seu perfil. Entre em contato com o suporte.');
          return;
        }

        setRedirecting(true);
        router.push(defaultRoute);
      } catch (err) {
        console.error('Erro no redirecionamento do dashboard:', err);
        setError('Erro interno. Por favor, tente novamente ou entre em contato com o suporte.');
      }
    }
  }, [user, loading, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background-secondary" role="main">
        <div className="animate-fade-in">
          <div className="card-modern max-w-md mx-auto">
            <div className="p-8 text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-error/20 to-warning/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg 
                  className="w-10 h-10 text-error" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.004-.833-.77-2.5 1.732-2.5z" />
                </svg>
              </div>

              {/* Error Content */}
              <h1 className="text-xl font-bold text-text-primary mb-3">Erro de Acesso</h1>
              <p className="text-text-secondary mb-6 leading-relaxed" role="alert">{error}</p>
              
              {/* Action Button */}
              <button
                onClick={() => router.push('/login')}
                className="button-primary w-full group"
                aria-label="Voltar para página de login"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Voltar ao Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background-secondary" role="main">
      <div className="text-center animate-fade-in">
        {/* Loading Container */}
        <div className="card-modern p-8 max-w-md mx-auto">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse"></div>
            <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          {/* Loading Spinner */}
          <div className="relative mb-6">
            <div className="loading-spinner w-8 h-8 border-primary/30 border-t-primary mx-auto"></div>
          </div>
          
          {/* Status Text */}
          <h1 className="text-xl font-bold text-text-primary mb-2">
            {redirecting ? 'Redirecionando...' : 'Carregando...'}
          </h1>
          
          <p className="text-text-secondary leading-relaxed mb-6">
            {redirecting 
              ? 'Aguarde enquanto você é redirecionado para seu dashboard personalizado.'
              : 'Verificando suas permissões e configurando o ambiente.'
            }
          </p>
          
          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse transition-all duration-1000" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-text-tertiary">Configurando experiência personalizada...</p>
          </div>

          {/* Feature Hints */}
          <div className="mt-8 grid grid-cols-3 gap-4 opacity-70">
            <div className="text-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs text-text-tertiary">Dashboard</p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-xs text-text-tertiary">Conteúdo</p>
            </div>
            
            <div className="text-center">
              <div className="w-8 h-8 bg-accent-green/10 rounded-lg flex items-center justify-center mx-auto mb-2">
                <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-xs text-text-tertiary">Perfil</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

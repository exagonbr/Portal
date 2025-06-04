'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { toast } from '@/components/Toast';
import { unifiedApi, handleApiError } from '@/services/unifiedApiClient';

interface LoginFormData {
  email: string;
  password: string;
}

const initialValues: LoginFormData = {
  email: '',
  password: '',
};

const validationRules = {
  email: (value: string) => {
    if (!value) return 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
    return '';
  },
  password: (value: string) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return '';
  },
};

export function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Usar try-catch para obter login do AuthContext de forma segura
  let loginFn: ((email: string, password: string) => Promise<void>) | null = null;
  
  try {
    const auth = useAuth();
    if (auth && auth.login) {
      loginFn = auth.login;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao usar AuthContext no LoginForm:', error);
  }

  const handleLoginSubmit = async (formValues: LoginFormData) => {
    try {
      setSubmitError('');
      console.log('🔐 Iniciando login via formulário para:', formValues.email);
      
      if (loginFn) {
        // Usar a função direta do contexto se disponível
        await loginFn(formValues.email, formValues.password);
        toast.success('Login realizado com sucesso!');
      } else {
        // Usar o cliente unificado como fallback
        console.warn('⚠️ Usando cliente API unificado para login');
        
        const response = await unifiedApi.login(formValues.email, formValues.password);
        
        if (response.success) {
          toast.success('Login realizado com sucesso!');
          
          // Verificar se o token foi salvo corretamente
          const savedToken = unifiedApi.getAuthToken();
          if (savedToken) {
            console.log('✅ Token salvo e verificado');
          } else {
            console.warn('⚠️ Token não foi salvo corretamente');
          }
          
          router.push('/dashboard');
        } else {
          throw new Error(response.message || 'Falha na autenticação');
        }
      }
    } catch (error: any) {
      console.error('❌ Erro durante o login:', error);
      
      // Usar handleApiError para tratamento consistente
      const errorMessage = handleApiError(error);
      
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm<LoginFormData>({
    initialValues,
    validationRules,
    onSubmit: handleLoginSubmit
  });

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setSubmitError('');
      console.log('🔐 Iniciando login via Google');
      
      const result = await signIn('google', { 
        callbackUrl: '/dashboard',
        redirect: false 
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        toast.success('Login com Google realizado com sucesso!');
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('❌ Erro durante login Google:', error);
      const errorMessage = error.message || 'Erro ao realizar login com Google. Por favor, tente novamente.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-8" role="form" aria-label="Formulário de login">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.email && errors.email ? 'true' : 'false'}
              aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                touched.email && errors.email
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
              }`}
            />
            {touched.email && errors.email && (
              <p className="mt-2 text-sm text-red-600" id="email-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={touched.password && errors.password ? 'true' : 'false'}
              aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
              className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                touched.password && errors.password
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
              }`}
            />
            {touched.password && errors.password && (
              <p className="mt-2 text-sm text-red-600" id="password-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {submitError && (
          <div className="rounded-md bg-red-50 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-red-400" aria-hidden="true">error</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Acessando...' : 'Acessar'}
          </button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-busy={isGoogleLoading}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M1 12.23c0-.78.07-1.53.2-2.25h5.92v4.26H4.56l-.01.07C4.13 15.36 2.62 17.25 1 12.23z"
              fill="#34A853"
            />
            <path
              d="M8.07 17.93c-3.09-.63-5.6-3.12-6.19-6.23L4.56 14.28c.63 1.73 2.04 3.16 3.51 3.65z"
              fill="#EA4335"
            />
            <path
              d="M8.07 6.07c3.09.63 5.6 3.12 6.19 6.23L11.58 9.72c-.63-1.73-2.04-3.16-3.51-3.65z"
              fill="#FBBC05"
            />
          </svg>
          {isGoogleLoading ? 'Conectando...' : 'Continuar com Google'}
        </button>
      </div>
    </div>
  );
}

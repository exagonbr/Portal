'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDashboardPath, isValidRole, convertBackendRole } from '@/utils/roleRedirect';
import { useToast } from '@/components/Toast';
import Link from 'next/link';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

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
  const { login } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validação básica
      if (!email.trim()) {
        throw new Error('Por favor, informe seu email.');
      }

      if (!password.trim()) {
        throw new Error('Por favor, informe sua senha.');
      }

      if (!email.includes('@')) {
        throw new Error('Por favor, informe um email válido.');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      const result = await login(email, password);

      if (result.success) {
        showToast({
          type: 'success',
          title: 'Sucesso!',
          message: 'Login realizado com sucesso! Redirecionando...'
        });
        router.push('/dashboard');
      } else {
        throw new Error(result.message || 'Não foi possível realizar o login. Por favor, tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.message || 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
      showToast({
        type: 'error',
        title: 'Erro no Login',
        message: err.message || 'Não foi possível realizar o login. Por favor, tente novamente.'
      });
    } finally {
      setLoading(false);
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${
                error && !email.trim() ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              placeholder="seu@email.com"
            />
            {error && !email.trim() && (
              <p className="mt-2 text-sm text-red-600">
                Por favor, informe seu email.
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none block w-full px-3 py-2 border ${
                error && !password.trim() ? 'border-red-300' : 'border-gray-300'
              } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
              placeholder="••••••••"
            />
            {error && !password.trim() && (
              <p className="mt-2 text-sm text-red-600">
                Por favor, informe sua senha.
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro no Login
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-primary-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Esqueceu sua senha?
            </Link>
          </div>
          <div className="text-sm">
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Criar uma conta
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

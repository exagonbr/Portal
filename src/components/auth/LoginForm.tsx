'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';
import { signIn, signOut } from 'next-auth/react';
import { getDashboardPath, isValidRole } from '../../utils/roleRedirect';

interface LoginFormData {
  email: string;
  password: string;
}

interface SearchFormData {
  numeroLicenca: string;
  aws: string;
}

const initialValues: LoginFormData = {
  email: '',
  password: ''
};

const searchInitialValues: SearchFormData = {
  numeroLicenca: '',
  aws: ''
};

const validationRules = {
  email: (value: string) => {
    if (!value) return 'O email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de email inválido';
    return '';
  },
  password: (value: string) => {
    if (!value) return 'A senha é obrigatória';
    if (value.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    return '';
  }
};

const searchValidationRules = {
  numeroLicenca: (value: string) => {
    if (!value) return 'O número da licença é obrigatório';
    return '';
  },
  aws: (value: string) => {
    if (!value) return 'O AWS é obrigatório';
    return '';
  }
};

export function LoginForm() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFormKey, setSearchFormKey] = useState(0);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<LoginFormData>({
    initialValues,
    validationRules,
    onSubmit: async (formValues) => {
      try {
        setSubmitError('');
        await login(formValues.email, formValues.password);
      } catch (error) {
        console.error('Erro durante o login:', error);
        setSubmitError('Email ou senha incorretos. Por favor, tente novamente.');
      }
    }
  });

  const {
    values: searchValues,
    errors: searchErrors,
    touched: searchTouched,
    isSubmitting: isSearchSubmitting,
    handleChange: handleSearchChange,
    handleBlur: handleSearchBlur,
    handleSubmit: handleSearchSubmit
  } = useForm<SearchFormData>({
    initialValues: searchInitialValues,
    validationRules: searchValidationRules,
    onSubmit: async (formValues) => {
      try {
        console.log('Dados de busca:', formValues);
        // Aqui você pode implementar a lógica de busca
        // Por exemplo, fazer uma chamada para API
        alert(`Buscando por Licença: ${formValues.numeroLicenca}, AWS: ${formValues.aws}`);
        setIsModalOpen(false);
        setSearchFormKey(prev => prev + 1);
      } catch (error) {
        console.error('Erro durante a busca:', error);
      }
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setSubmitError('');
      
      const result = await signIn('google', { redirect: false });
      
      if (result?.ok && !result?.error) {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        if (session?.user?.role) {
          const userRole = session.user.role;
          const normalizedRole = userRole?.toLowerCase();
          
          if (!isValidRole(normalizedRole)) {
            console.error(`Role inválida detectada no login Google: ${userRole}`);
            await signOut();
            setSubmitError('Perfil de usuário inválido. Por favor, entre em contato com o administrador.');
            return;
          }
          
          const dashboardPath = getDashboardPath(normalizedRole);
          
          if (dashboardPath) {
            console.log(`Redirecionando usuário Google ${session.user.name} (${userRole}) para: ${dashboardPath}`);
            router.push(dashboardPath);
          } else {
            console.error(`Caminho do dashboard não encontrado para a role: ${userRole}`);
            setSubmitError('Erro interno. Por favor, entre em contato com o administrador.');
          }
        } else {
          setSubmitError('Sessão inválida. Por favor, tente novamente.');
        }
      }
      
      if (result?.error) {
        console.error('Erro no login Google:', result.error);
        setSubmitError('Erro ao realizar login com Google. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Erro durante login Google:', error);
      setSubmitError('Erro ao realizar login com Google. Por favor, tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSearchFormKey(prev => prev + 1);
  };

  return (
    <>
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

          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
            >
              Esqueceu sua senha?
            </a>
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

        <div className="space-y-3">
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
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isGoogleLoading ? 'Conectando...' : 'Acessar com Google'}
          </button>

          <button
            type="button"
            onClick={openModal}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            Validar Licença
          </button>
        </div>
      </div>

      {/* Modal de Busca */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeModal}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="relative inline-block align-bottom bg-white z-999 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                      Validar Licença
                    </h3>
                    
                    <form onSubmit={handleSearchSubmit} className="space-y-4" key={searchFormKey}>
                      <div>
                        <label htmlFor="numeroLicenca" className="block text-sm font-medium text-gray-700">
                          Número da Licença
                        </label>
                        <div className="mt-1">
                          <input
                            id="numeroLicenca"
                            name="numeroLicenca"
                            type="text"
                            required
                            value={searchValues.numeroLicenca}
                            onChange={handleSearchChange}
                            onBlur={handleSearchBlur}
                            aria-invalid={searchTouched.numeroLicenca && searchErrors.numeroLicenca ? 'true' : 'false'}
                            aria-describedby={searchTouched.numeroLicenca && searchErrors.numeroLicenca ? 'numeroLicenca-error' : undefined}
                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                              searchTouched.numeroLicenca && searchErrors.numeroLicenca
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
                            }`}
                            placeholder="Digite o número da licença do certificado"
                          />
                          {searchTouched.numeroLicenca && searchErrors.numeroLicenca && (
                            <p className="mt-2 text-sm text-red-600" id="numeroLicenca-error" role="alert">
                              {searchErrors.numeroLicenca}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="aws" className="block text-sm font-medium text-gray-700">
                          Ultimos 4 Numeros do CPF
                        </label>
                        <div className="mt-1">
                          <input
                            id="aws"
                            name="aws"
                            type="text"
                            required
                            value={searchValues.aws}
                            onChange={handleSearchChange}
                            onBlur={handleSearchBlur}
                            aria-invalid={searchTouched.aws && searchErrors.aws ? 'true' : 'false'}
                            aria-describedby={searchTouched.aws && searchErrors.aws ? 'aws-error' : undefined}
                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 ${
                              searchTouched.aws && searchErrors.aws
                                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-accent-blue focus:border-accent-blue'
                            }`}
                            placeholder="0-000"
                          />
                          {searchTouched.aws && searchErrors.aws && (
                            <p className="mt-2 text-sm text-red-600" id="aws-error" role="alert">
                              {searchErrors.aws}
                            </p>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={isSearchSubmitting}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearchSubmitting ? 'Buscando...' : 'Buscar'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

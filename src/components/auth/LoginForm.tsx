'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';
import { signIn, signOut } from 'next-auth/react';
import { getDashboardPath, isValidRole } from '../../utils/roleRedirect';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const [submitError, setSubmitError] = useState<string>('');
  const [retryAfter, setRetryAfter] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFormKey, setSearchFormKey] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
 
  useEffect(() => {
    if (retryAfter > 0) {
      const timer = setTimeout(() => setRetryAfter(retryAfter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [retryAfter]);
 
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
    onSubmit: useCallback(async (formValues) => {
      try {
        setSubmitError('');
        await login(formValues.email, formValues.password);
      } catch (error: any) {
        console.error('Erro durante o login:', error);
        if (error.message && error.message.includes('Too Many Requests')) {
          const retrySeconds = 60;
          setRetryAfter(retrySeconds);
          setSubmitError(`Muitas tentativas de login. Tente novamente em ${retrySeconds} segundos.`);
        } else {
          setSubmitError(error.message || 'Email ou senha incorretos. Por favor, tente novamente.');
        }
      }
    }, [login])
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label 
              htmlFor="email" 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.text.secondary }}
            >
              Email
            </label>
            <div className="relative">
              <span 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                style={{ color: theme.colors.text.tertiary }}
              >
                mail
              </span>
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
                className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                  touched.email && errors.email
                    ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-2 focus:ring-2'
                }`}
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: touched.email && errors.email ? theme.colors.status.error : theme.colors.border.DEFAULT,
                  color: theme.colors.text.primary,
                  ...(!(touched.email && errors.email) && {
                    ':focus': {
                      borderColor: theme.colors.primary.DEFAULT,
                      '--tw-ring-color': theme.colors.primary.light
                    }
                  })
                }}
                placeholder="seu@email.com"
              />
              {touched.email && errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm flex items-center gap-1" 
                  style={{ color: theme.colors.status.error }}
                  id="email-error" 
                  role="alert"
                >
                  <span className="material-symbols-outlined text-base">error</span>
                  {errors.email}
                </motion.p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label 
              htmlFor="password" 
              className="block text-sm font-medium mb-2"
              style={{ color: theme.colors.text.secondary }}
            >
              Senha
            </label>
            <div className="relative">
              <span 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                style={{ color: theme.colors.text.tertiary }}
              >
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={touched.password && errors.password ? 'true' : 'false'}
                aria-describedby={touched.password && errors.password ? 'password-error' : undefined}
                className={`appearance-none block w-full pl-10 pr-10 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                  touched.password && errors.password
                    ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border-2 focus:ring-2'
                }`}
                style={{
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: touched.password && errors.password ? theme.colors.status.error : theme.colors.border.DEFAULT,
                  color: theme.colors.text.primary,
                  ...(!(touched.password && errors.password) && {
                    ':focus': {
                      borderColor: theme.colors.primary.DEFAULT,
                      '--tw-ring-color': theme.colors.primary.light
                    }
                  })
                }}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                style={{ color: theme.colors.text.tertiary }}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
              {touched.password && errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm flex items-center gap-1" 
                  style={{ color: theme.colors.status.error }}
                  id="password-error" 
                  role="alert"
                >
                  <span className="material-symbols-outlined text-base">error</span>
                  {errors.password}
                </motion.p>
              )}
            </div>
          </motion.div>

          {submitError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg p-4 flex items-start gap-3" 
              style={{
                backgroundColor: `${theme.colors.status.error}20`,
                border: `1px solid ${theme.colors.status.error}40`
              }}
              role="alert"
            >
              <span 
                className="material-symbols-outlined text-xl mt-0.5" 
                style={{ color: theme.colors.status.error }}
                aria-hidden="true"
              >
                error
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-medium" style={{ color: theme.colors.status.error }}>
                  {submitError}
                  {retryAfter > 0 && (
                    <span className="block mt-1 text-xs">
                      Aguarde {retryAfter}s...
                    </span>
                  )}
                </h3>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <button
              type="submit"
              disabled={isSubmitting || retryAfter > 0}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{
                backgroundColor: theme.colors.primary.DEFAULT,
                color: theme.colors.primary.contrast,
                boxShadow: theme.shadows.md
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                e.currentTarget.style.boxShadow = theme.shadows.lg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
                e.currentTarget.style.boxShadow = theme.shadows.md;
              }}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="material-symbols-outlined"
                  >
                    progress_activity
                  </motion.span>
                  Acessando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">login</span>
                  Acessar
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: theme.colors.border.light }} />
          </div>
          <div className="relative flex justify-center text-sm">
            <span 
              className="px-2" 
              style={{ 
                backgroundColor: theme.type === 'modern' ? theme.colors.background.card : theme.colors.background.primary,
                color: theme.colors.text.tertiary 
              }}
            >
              ou continue com
            </span>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            style={{
              backgroundColor: theme.colors.background.card,
              border: `2px solid ${theme.colors.border.DEFAULT}`,
              color: theme.colors.text.primary
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.DEFAULT;
              e.currentTarget.style.backgroundColor = `${theme.colors.primary.DEFAULT}10`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
              e.currentTarget.style.backgroundColor = theme.colors.background.card;
            }}
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
            {isGoogleLoading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined"
                >
                  progress_activity
                </motion.span>
                Conectando...
              </>
            ) : (
              'Acessar com Google'
            )}
          </button>

          <button
            type="button"
            onClick={openModal}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: theme.colors.secondary.DEFAULT,
              color: theme.colors.secondary.contrast,
              boxShadow: theme.shadows.md
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondary.dark;
              e.currentTarget.style.boxShadow = theme.shadows.lg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.secondary.DEFAULT;
              e.currentTarget.style.boxShadow = theme.shadows.md;
            }}
          >
            <span className="material-symbols-outlined" aria-hidden="true">verified</span>
            Validar Licença
          </button>
        </motion.div>
      </div>

      {/* Modal de Busca */}
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto" 
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 backdrop-blur-sm transition-opacity" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
              aria-hidden="true" 
              onClick={closeModal}
            />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              style={{
                backgroundColor: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.DEFAULT}`
              }}
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 
                      className="text-lg leading-6 font-medium mb-4" 
                      id="modal-title"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Validar Licença
                    </h3>
                    
                    <form onSubmit={handleSearchSubmit} className="space-y-4" key={searchFormKey}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label 
                          htmlFor="numeroLicenca" 
                          className="block text-sm font-medium mb-2"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          Número da Licença
                        </label>
                        <div className="relative">
                          <span 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                            style={{ color: theme.colors.text.tertiary }}
                          >
                            badge
                          </span>
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
                            className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                              searchTouched.numeroLicenca && searchErrors.numeroLicenca
                                ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-2 focus:ring-2'
                            }`}
                            style={{
                              backgroundColor: theme.colors.background.secondary,
                              borderColor: searchTouched.numeroLicenca && searchErrors.numeroLicenca ? theme.colors.status.error : theme.colors.border.DEFAULT,
                              color: theme.colors.text.primary,
                              ...(!(searchTouched.numeroLicenca && searchErrors.numeroLicenca) && {
                                ':focus': {
                                  borderColor: theme.colors.primary.DEFAULT,
                                  '--tw-ring-color': theme.colors.primary.light
                                }
                              })
                            }}
                            placeholder="Digite o número da licença do certificado"
                          />
                          {searchTouched.numeroLicenca && searchErrors.numeroLicenca && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm flex items-center gap-1" 
                              style={{ color: theme.colors.status.error }}
                              id="numeroLicenca-error" 
                              role="alert"
                            >
                              <span className="material-symbols-outlined text-base">error</span>
                              {searchErrors.numeroLicenca}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <label 
                          htmlFor="aws" 
                          className="block text-sm font-medium mb-2"
                          style={{ color: theme.colors.text.secondary }}
                        >
                          Últimos 4 Números do CPF
                        </label>
                        <div className="relative">
                          <span 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-xl"
                            style={{ color: theme.colors.text.tertiary }}
                          >
                            pin
                          </span>
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
                            className={`appearance-none block w-full pl-10 pr-3 py-3 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 ${
                              searchTouched.aws && searchErrors.aws
                                ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                                : 'border-2 focus:ring-2'
                            }`}
                            style={{
                              backgroundColor: theme.colors.background.secondary,
                              borderColor: searchTouched.aws && searchErrors.aws ? theme.colors.status.error : theme.colors.border.DEFAULT,
                              color: theme.colors.text.primary,
                              ...(!(searchTouched.aws && searchErrors.aws) && {
                                ':focus': {
                                  borderColor: theme.colors.primary.DEFAULT,
                                  '--tw-ring-color': theme.colors.primary.light
                                }
                              })
                            }}
                            placeholder="0-000"
                          />
                          {searchTouched.aws && searchErrors.aws && (
                            <motion.p 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm flex items-center gap-1" 
                              style={{ color: theme.colors.status.error }}
                              id="aws-error" 
                              role="alert"
                            >
                              <span className="material-symbols-outlined text-base">error</span>
                              {searchErrors.aws}
                            </motion.p>
                          )}
                        </div>
                      </motion.div>
                    </form>
                  </div>
                </div>
              </div>
              
              <div 
                className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t"
                style={{ 
                  backgroundColor: theme.colors.background.secondary,
                  borderColor: theme.colors.border.light
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleSearchSubmit}
                  disabled={isSearchSubmitting}
                  className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    backgroundColor: theme.colors.primary.DEFAULT,
                    color: theme.colors.primary.contrast,
                    boxShadow: theme.shadows.md
                  }}
                  onMouseEnter={(e) => {
                    if (!isSearchSubmitting) {
                      e.currentTarget.style.backgroundColor = theme.colors.primary.dark;
                      e.currentTarget.style.boxShadow = theme.shadows.lg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT;
                    e.currentTarget.style.boxShadow = theme.shadows.md;
                  }}
                >
                  {isSearchSubmitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="material-symbols-outlined mr-2"
                      >
                        progress_activity
                      </motion.span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined mr-2">search</span>
                      Buscar
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-200"
                  style={{
                    backgroundColor: theme.colors.background.card,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.DEFAULT}`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                    e.currentTarget.style.borderColor = theme.colors.border.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.card;
                    e.currentTarget.style.borderColor = theme.colors.border.DEFAULT;
                  }}
                >
                  <span className="material-symbols-outlined mr-2">close</span>
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </>
  );
}

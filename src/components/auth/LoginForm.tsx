'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../../hooks/useForm';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const initialValues: LoginFormData = {
  email: '',
  password: ''
};

const validationRules = {
  email: (value: string) => {
    if (!value) return 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
    return '';
  },
  password: (value: string) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return '';
  }
};

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

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
        const response = await login(formValues.email, formValues.password);
        if (response.success && response.user) {
          const dashboardPath = response.user.role === 'student' 
            ? '/dashboard/student' 
            : '/dashboard/teacher';
          router.push(dashboardPath);
        } else {
          setSubmitError('Email ou senha inválidos');
        }
      } catch (error) {
        setSubmitError('Email ou senha inválidos');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
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
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              touched.email && errors.email
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {touched.email && errors.email && (
            <p className="mt-2 text-sm text-red-600" id="email-error">
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
            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
              touched.password && errors.password
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          />
          {touched.password && errors.password && (
            <p className="mt-2 text-sm text-red-600" id="password-error">
              {errors.password}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="material-symbols-outlined text-red-400">error</span>
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
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </div>
    </form>
  );
}

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
          // Redirect based on user role
          const dashboardPath = response.user.role === 'student' 
            ? '/dashboard/student' 
            : '/dashboard/teacher';
          router.push(dashboardPath);
        }
      } catch (error) {
        setSubmitError('Email ou senha inválidos');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 input-field ${touched.email && errors.email ? 'border-error' : ''}`}
        />
        {touched.email && errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary">
          Senha
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 input-field ${touched.password && errors.password ? 'border-error' : ''}`}
        />
        {touched.password && errors.password && (
          <p className="mt-1 text-sm text-error">{errors.password}</p>
        )}
      </div>

      {submitError && (
        <div className="p-3 rounded bg-error/10 text-error text-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full button-primary disabled:opacity-50"
      >
        {isSubmitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from '../../hooks/useForm';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'teacher' | 'parent';
}

const initialValues: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'student'
};

const validationRules: {
  [K in keyof RegisterFormData]: (value: RegisterFormData[K], formData?: RegisterFormData) => string;
} = {
  name: (value) => {
    if (!value) return 'Nome é obrigatório';
    if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    return '';
  },
  email: (value) => {
    if (!value) return 'Email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
    return '';
  },
  password: (value) => {
    if (!value) return 'Senha é obrigatória';
    if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return '';
  },
  confirmPassword: (value, formData) => {
    if (!value) return 'Confirmação de senha é obrigatória';
    if (formData && value !== formData.password) return 'Senhas não conferem';
    return '';
  },
  role: (value) => {
    if (!value) return 'Tipo de usuário é obrigatório';
    return '';
  }
};

export function RegisterForm() {
  const [submitError, setSubmitError] = useState<string>('');

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<RegisterFormData>({
    initialValues,
    validationRules,
    onSubmit: async (formValues: RegisterFormData) => {
      try {
        setSubmitError('');
        // API call would go here
        console.log('Form submitted:', formValues);
      } catch (error) {
        setSubmitError('Erro ao registrar. Tente novamente.');
      }
    }
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-text-primary">
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 input-field ${touched.name && errors.name ? 'border-error' : ''}`}
        />
        {touched.name && errors.name && (
          <p className="mt-1 text-sm text-error">{errors.name}</p>
        )}
      </div>

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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary">
          Confirmar Senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 input-field ${touched.confirmPassword && errors.confirmPassword ? 'border-error' : ''}`}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="role" className="block text-sm font-medium text-text-primary">
          Tipo de Usuário
        </label>
        <select
          id="role"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`mt-1 input-field ${touched.role && errors.role ? 'border-error' : ''}`}
        >
          <option value="student">Estudante</option>
          <option value="teacher">Professor</option>
          <option value="parent">Responsável</option>
        </select>
        {touched.role && errors.role && (
          <p className="mt-1 text-sm text-error">{errors.role}</p>
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
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}

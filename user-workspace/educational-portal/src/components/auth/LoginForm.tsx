'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { useForm, patterns } from '@/hooks/useForm'
import { Input, FormGroup, SubmitButton } from '@/components/forms/FormComponents'

interface LoginFormData {
  email: string
  password: string
  rememberMe: boolean
}

const initialValues: LoginFormData = {
  email: '',
  password: '',
  rememberMe: false
}

const validationRules = {
  email: {
    required: 'E-mail é obrigatório',
    pattern: patterns.email
  },
  password: {
    required: 'Senha é obrigatória',
    minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
  }
}

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<LoginFormData>(
    initialValues,
    validationRules,
    async (formData) => {
      try {
        console.log('LoginForm: Attempting login with:', formData.email);
        await login(formData.email, formData.password)
        showToast({
          type: 'success',
          message: 'Login realizado com sucesso!'
        })
        router.push('/dashboard')
      } catch (error: any) {
        console.error('LoginForm: Login failed:', error);
        showToast({
          type: 'error',
          message: error.message || 'Erro ao fazer login. Verifique suas credenciais.'
        })
      }
    }
  )

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormGroup>
          <Input
            label="E-mail"
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={errors.email}
            placeholder="seu@email.com"
          />

          <div className="relative">
            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="password"
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.password}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center top-6"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </FormGroup>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              checked={values.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
              Lembrar-me
            </label>
          </div>

          <div className="text-sm">
            <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
              Esqueceu sua senha?
            </a>
          </div>
        </div>

        <SubmitButton loading={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </SubmitButton>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continue com</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Entrar com Google</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
            </button>

            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Entrar com Facebook</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="relative flex justify-center text-sm">
              <span className="text-gray-500">
                Não tem uma conta?{' '}
                <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                  Cadastre-se
                </a>
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

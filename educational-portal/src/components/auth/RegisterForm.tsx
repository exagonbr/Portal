'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import { useForm, patterns } from '@/hooks/useForm'
import { Input, Select, FormGroup, SubmitButton } from '@/components/forms/FormComponents'

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  type: 'student' | 'teacher'
  cpf: string
  phone: string
}

const initialValues: RegisterFormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  type: 'student',
  cpf: '',
  phone: ''
}

const validationRules = {
  name: {
    required: 'Nome é obrigatório',
    minLength: { value: 3, message: 'Nome deve ter no mínimo 3 caracteres' }
  },
  email: {
    required: 'E-mail é obrigatório',
    pattern: patterns.email
  },
  password: {
    required: 'Senha é obrigatória',
    minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
  },
  confirmPassword: {
    required: 'Confirmação de senha é obrigatória',
    validate: (value: string, formValues: RegisterFormData) => 
      value === formValues.password ? undefined : 'As senhas não coincidem'
  },
  cpf: {
    required: 'CPF é obrigatório',
    pattern: patterns.cpf
  },
  phone: {
    required: 'Telefone é obrigatório',
    pattern: patterns.phone
  }
}

const userTypeOptions = [
  { value: 'student', label: 'Aluno' },
  { value: 'teacher', label: 'Professor' }
]

export default function RegisterForm() {
  const router = useRouter()
  const { register } = useAuth()
  const { showToast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField
  } = useForm<RegisterFormData>(
    initialValues,
    validationRules,
    async (formData) => {
      try {
        await register(formData.name, formData.email, formData.password, formData.type)
        showToast({
          type: 'success',
          message: 'Cadastro realizado com sucesso!'
        })
        router.push('/dashboard')
      } catch (error) {
        showToast({
          type: 'error',
          message: 'Erro ao realizar cadastro. Tente novamente.'
        })
      }
    }
  )

  const validateStep = (step: number) => {
    if (step === 1) {
      const stepFields = ['name', 'email', 'password', 'confirmPassword']
      return stepFields.every(field => !validateField(field, values[field]))
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  return (
    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        {currentStep === 1 && (
          <FormGroup>
            <Input
              label="Nome Completo"
              type="text"
              name="name"
              id="name"
              autoComplete="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.name}
              placeholder="João Silva"
            />

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

            <Input
              label="Confirmar Senha"
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="confirmPassword"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </FormGroup>
        )}

        {currentStep === 2 && (
          <FormGroup>
            <Select
              label="Tipo de Usuário"
              name="type"
              id="type"
              value={values.type}
              onChange={handleChange}
              onBlur={handleBlur}
              options={userTypeOptions}
              error={errors.type}
            />

            <Input
              label="CPF"
              type="text"
              name="cpf"
              id="cpf"
              value={values.cpf}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.cpf}
              placeholder="000.000.000-00"
            />

            <Input
              label="Telefone"
              type="text"
              name="phone"
              id="phone"
              value={values.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.phone}
              placeholder="(00) 00000-0000"
            />
          </FormGroup>
        )}

        <div className="flex justify-between space-x-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar
            </button>
          )}

          {currentStep < 2 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Próximo
            </button>
          ) : (
            <SubmitButton loading={isSubmitting} className="flex-1">
              {isSubmitting ? 'Cadastrando...' : 'Criar Conta'}
            </SubmitButton>
          )}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="relative flex justify-center text-sm">
              <span className="text-gray-500">
                Já tem uma conta?{' '}
                <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Faça login
                </a>
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

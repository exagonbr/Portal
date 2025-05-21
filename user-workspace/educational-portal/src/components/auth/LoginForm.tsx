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
        await login(formData.email, formData.password)
        showToast({
          type: 'success',
          message: 'Login realizado com sucesso!'
        })
        router.push('/dashboard')
      } catch (error) {
        showToast({
          type: 'error',
          message: 'Erro ao fazer login. Verifique suas credenciais.'
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

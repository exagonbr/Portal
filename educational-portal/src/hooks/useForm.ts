'use client'

import { useState, useCallback } from 'react'

type ValidationRule = {
  required?: boolean | string
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  validate?: (value: any) => string | undefined
}

type ValidationRules = {
  [key: string]: ValidationRule
}

type FormErrors = {
  [key: string]: string
}

export function useForm<T extends { [key: string]: any }>(
  initialValues: T,
  validationRules?: ValidationRules,
  onSubmit?: (values: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const validateField = useCallback((name: string, value: any): string | undefined => {
    if (!validationRules || !validationRules[name]) return undefined

    const rules = validationRules[name]

    if (rules.required) {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return typeof rules.required === 'string' 
          ? rules.required 
          : 'Este campo é obrigatório'
      }
    }

    if (rules.minLength && typeof value === 'string') {
      if (value.length < rules.minLength.value) {
        return rules.minLength.message
      }
    }

    if (rules.maxLength && typeof value === 'string') {
      if (value.length > rules.maxLength.value) {
        return rules.maxLength.message
      }
    }

    if (rules.pattern && typeof value === 'string') {
      if (!rules.pattern.value.test(value)) {
        return rules.pattern.message
      }
    }

    if (rules.validate) {
      return rules.validate(value)
    }

    return undefined
  }, [validationRules])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    Object.keys(values).forEach((key) => {
      const error = validateField(key, values[key])
      if (error) {
        newErrors[key] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [values, validateField])

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target
    const newValue = type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : value

    setValues((prev) => ({ ...prev, [name]: newValue }))
    
    if (touched[name]) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    
    const error = validateField(name, values[name])
    setErrors((prev) => ({
      ...prev,
      [name]: error || ''
    }))
  }, [values, validateField])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {}
    )
    setTouched(allTouched)

    if (validateForm()) {
      setIsSubmitting(true)
      try {
        await onSubmit?.(values)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, validateForm, onSubmit])

  const setValue = useCallback((name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error || ''
      }))
    }
  }, [touched, validateField])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    reset
  }
}

// Common validation patterns
export const patterns = {
  email: {
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: 'Endereço de e-mail inválido'
  },
  phone: {
    value: /^\(\d{2}\) \d{4,5}-\d{4}$/,
    message: 'Número de telefone inválido'
  },
  cpf: {
    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: 'CPF inválido'
  },
  cep: {
    value: /^\d{5}-\d{3}$/,
    message: 'CEP inválido'
  }
}

// Example usage:
/*
const { 
  values, 
  errors, 
  handleChange, 
  handleBlur, 
  handleSubmit,
  isSubmitting 
} = useForm(
  {
    email: '',
    password: ''
  },
  {
    email: {
      required: 'E-mail é obrigatório',
      pattern: patterns.email
    },
    password: {
      required: 'Senha é obrigatória',
      minLength: { value: 6, message: 'Senha deve ter no mínimo 6 caracteres' }
    }
  },
  async (values) => {
    // Handle form submission
    await submitForm(values)
  }
)
*/

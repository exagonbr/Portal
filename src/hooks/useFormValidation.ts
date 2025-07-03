'use client'

import { useState, useCallback } from 'react'

type ValidationRule<T> = {
  required?: boolean | string
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  validate?: (value: any, formValues: T) => string | undefined
}

type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T>
}

type FormErrors<T> = {
  [K in keyof T]?: string
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => Promise<void> | void
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors<T>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({})

  const validateField = useCallback((name: keyof T, value: any): string | undefined => {
    if (!validationRules || !validationRules[name]) return undefined

    const rules = validationRules[name]!

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
      return rules.validate(value, values)
    }

    return undefined
  }, [validationRules, values])

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {}
    let formIsValid = true

    for (const key in values) {
      const error = validateField(key, values[key])
      if (error) {
        newErrors[key] = error
        formIsValid = false
      }
    }

    setErrors(newErrors)
    return formIsValid
  }, [values, validateField])

  const handleChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = event.target
    const newValue = type === 'checkbox' 
      ? (event.target as HTMLInputElement).checked 
      : value

    setValues((prev) => ({ ...prev, [name]: newValue }))
    
    if (touched[name as keyof T]) {
      const error = validateField(name as keyof T, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }))
    }
  }, [touched, validateField])

  const handleBlur = useCallback((
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    
    const error = validateField(name as keyof T, values[name as keyof T])
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }))
  }, [values, validateField])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as { [K in keyof T]: boolean }
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

  const setValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error
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
    reset,
    validateField
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

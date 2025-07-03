'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from '../../hooks/useForm';

interface ForgotPasswordFormData {
  email: string;
}

const initialValues: ForgotPasswordFormData = {
  email: ''
};

const validationRules = {
  email: (value: string) => {
    if (!value) return 'O email é obrigatório';
    if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de email inválido';
    return '';
  }
};

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit
  } = useForm<ForgotPasswordFormData>({
    initialValues,
    validationRules,
    onSubmit: async (formValues) => {
      try {
        // Simular envio de email de recuperação
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSuccess(true);
      } catch (error) {
        console.error('Erro ao enviar email de recuperação:', error);
      }
    }
  });

  if (isSuccess) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" role="main">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover opacity-100"
            preload="auto"
          >
            <source src="/back_video4.mp4" type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        </div>

        {/* Content */}
        <div className="opacity-100 relative z-10 max-w-md w-full space-y-8 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
          <div className="text-center">
            <div className="relative w-48 h-16 mx-auto mb-6">
              <Image
                src="/sabercon-logo.png"
                alt="Sabercon Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 192px, 192px"
              />
            </div>
            
            <div className="rounded-md bg-green-50 p-4 border border-green-200" role="status">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400" aria-hidden="true">check_circle</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Email enviado com sucesso!</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-sm text-gray-600">
                Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
              </p>
              
              <div className="space-y-2">
                <button
                  onClick={() => setIsSuccess(false)}
                  className="w-full text-center text-sm text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Tentar novamente
                </button>
                
                <Link
                  href="/login"
                  className="block w-full text-center text-sm text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Voltar ao login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center" role="main">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-100"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>

      {/* Content */}
      <div className="opacity-100 relative z-10 max-w-md w-full space-y-8 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="text-center">
          <div className="relative w-48 h-16 mx-auto">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-gray-700 dark:text-gray-800">
            Recuperar senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Digite seu email para receber instruções de recuperação
          </p>
        </div>

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
                placeholder="seu.email@exemplo.com"
              />
              {touched.email && errors.email && (
                <p className="mt-2 text-sm text-red-600" id="email-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar instruções'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
            aria-label="Voltar ao login"
          >
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
} 
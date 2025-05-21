'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, user } = useAuth()
  const router = useRouter()

  // Redirect based on user type when user state changes
  useEffect(() => {
    if (user) {
      router.push(user.type === 'student' ? '/dashboard/student' : '/dashboard/teacher')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Redirect will happen in useEffect when user state updates
    } catch (err) {
      setError('Credenciais inválidas. Use teste123 como senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7FAFC] to-[#EDF2F7] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon"
              width={400}
              height={80}
              className="mx-auto mb-3"
              priority
            />
          </Link>
        </div>

        {/* Login Card */}
        <div className="login-card bg-white rounded-xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-[#1B365D] mb-6">Acesso</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full flex justify-center items-center py-3 text-base"
            >
              {loading ? (
                <div className="loading-spinner h-5 w-5 mr-2"></div>
              ) : null}
              Entrar
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-5 bg-gradient-to-br from-[#F8FAFC] to-[#EDF2F7] rounded-lg border border-gray-100">
            <h3 className="text-sm font-semibold text-[#1B365D] mb-3">Credenciais de teste:</h3>
            <div className="space-y-2.5 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Professor:</span>
                <span>ricardo.oliveira@edu.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Aluno:</span>
                <span>julia.c@edu.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Senha:</span>
                <span>teste123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/register" 
            className="text-[#1B365D] hover:text-[#2A4C80] text-sm font-medium transition-colors duration-200 hover:underline"
          >
            Não tem uma conta? Registre-se
          </Link>
        </div>
      </div>
    </div>
  )
}

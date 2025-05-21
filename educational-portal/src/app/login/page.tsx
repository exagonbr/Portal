'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError('Credenciais inválidas. Use teste123 como senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1B365D]">EduPortal</h1>
          <p className="text-gray-600 mt-2">Portal Educacional</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-[#1B365D] mb-6">Login</h2>

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
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center"
            >
              {loading ? (
                <div className="loading-spinner h-5 w-5 mr-2"></div>
              ) : null}
              Entrar
            </button>
          </form>

          {/* Test Credentials */}
          <div className="mt-8 p-4 bg-[#F7FAFC] rounded-md">
            <h3 className="text-sm font-semibold text-[#1B365D] mb-2">Credenciais de teste:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Professor: ricardo.oliveira@edu.com</p>
              <p>Aluno: julia.c@edu.com</p>
              <p>Senha: teste123</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/register" className="text-[#1B365D] hover:text-[#2A4C80] text-sm">
            Não tem uma conta? Registre-se
          </Link>
        </div>
      </div>
    </div>
  )
}

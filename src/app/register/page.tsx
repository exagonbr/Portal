'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [type, setType] = useState<'student' | 'teacher'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await register(name, email, password, type)
      router.push('/dashboard')
    } catch (err) {
      setError('Erro ao criar conta. Por favor, tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon"
              width={400}
              height={80}
              className="mx-auto"
              priority
            />
          </Link>
        </div>

        {/* Register Card */}
        <div className="card border-0 shadow-lg overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Criar nova conta</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Senha
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setType('student')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                      type === 'student'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30 text-text-secondary'
                    }`}
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('teacher')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center ${
                      type === 'teacher'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30 text-text-secondary'
                    }`}
                  >
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    Professor
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-error/10 text-error rounded-lg p-4 text-sm flex items-center animate-fade-in">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="button-primary w-full flex justify-center items-center py-3 text-base relative overflow-hidden"
              >
                {loading ? (
                  <div className="loading-spinner border-white/30 border-t-white"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Criar Conta
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link 
            href="/login" 
            className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Já tem uma conta?</span>
            <span className="ml-2 font-semibold">Faça login</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

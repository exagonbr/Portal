'use client'

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const [activeTab, setActiveTab] = useState('login')
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Error logging in')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2B4B6B] to-gray-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-16">
                <span className="text-4xl font-bold" style={{ color: '#BBEB6B' }}>SABER</span>
                <span className="text-4xl font-bold text-white">CON</span>
              </div>
            </div>
            <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Uma plataforma moderna para alunos e professores se conectarem, aprenderem e crescerem juntos.
            </p>
          </div>

          {/* Auth Section */}
          <div className="mt-16 bg-white rounded-lg shadow-xl max-w-md mx-auto overflow-hidden">
            <div className="flex border-b border-gray-200">
            </div>

            <div className="p-6">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2B4B6B] focus:border-[#2B4B6B]"
                    placeholder="Digite seu e-mail"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#2B4B6B] focus:border-[#2B4B6B]"
                    placeholder="Digite sua senha"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2B4B6B] hover:bg-[#1a3b5b] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4B6B]"
                  >
                    Entrar
                  </button>
                </div>
                <div className="text-sm text-center text-gray-600 mt-4">
                  Use estas credenciais de teste:<br/>
                  Professor: teacher@edu.com / teacher123<br/>
                  Aluno: student@edu.com / student123
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { ThemeSelector } from '@/components/ui/ThemeSelector'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import Table from '@/components/ui/Table'
import StatsGrid from '@/components/dashboard/StatsGrid'
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card'
import { Button, ButtonGroup } from '@/components/ui/Button';
import { motion } from 'framer-motion'
import { 
  Palette, 
  Brush, 
  Eye, 
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Stars,
  Zap,
  Heart
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';

export default function ThemeDemoPage() {
  const { theme, setTheme } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    description: ''
  })
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalThemes: 12,
    activeUsers: 1847,
    customizations: 256,
    satisfaction: 94.8,
    responsiveViews: 98.2,
    darkModeUsage: 67.3,
    mobileOptimization: 96.5,
    accessibilityScore: 91.4
  });

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => setLoading(false), 1000);
  }, []);

  // Sample data for table
  const tableData = [
    { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'Professor', status: 'Ativo', date: '2024-01-15' },
    { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'Aluno', status: 'Ativo', date: '2024-01-16' },
    { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', role: 'Coordenador', status: 'Inativo', date: '2024-01-17' },
    { id: '4', name: 'Ana Oliveira', email: 'ana@example.com', role: 'Professor', status: 'Ativo', date: '2024-01-18' },
    { id: '5', name: 'Carlos Ferreira', email: 'carlos@example.com', role: 'Aluno', status: 'Ativo', date: '2024-01-19' },
  ]

  const tableColumns = [
    {
      key: 'name',
      title: 'Nome',
      sortable: true,
      render: (value: string, record: any) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
            style={{ 
              backgroundColor: theme.colors.primary.light + '20',
              color: theme.colors.primary.DEFAULT
            }}
          >
            {value.charAt(0)}
          </div>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    { key: 'email', title: 'Email', sortable: true },
    { 
      key: 'role', 
      title: 'Função', 
      sortable: true,
      render: (value: string) => (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: theme.colors.secondary.light + '20',
            color: theme.colors.secondary.DEFAULT
          }}
        >
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      title: 'Status', 
      sortable: true,
      render: (value: string) => (
        <span 
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: value === 'Ativo' 
              ? theme.colors.status.success + '20'
              : theme.colors.status.error + '20',
            color: value === 'Ativo' 
              ? theme.colors.status.success
              : theme.colors.status.error
          }}
        >
          {value}
        </span>
      )
    },
    { key: 'date', title: 'Data', sortable: true }
  ]

  const roleOptions = [
    { value: 'teacher', label: 'Professor' },
    { value: 'student', label: 'Aluno' },
    { value: 'coordinator', label: 'Coordenador' },
    { value: 'manager', label: 'Gestor' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardPageLayout
      title="🎨 Demonstração de Temas"
      subtitle="Explore os temas e personalizações disponíveis"
    >
      <div className="space-y-8">
        {/* Cards de Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total de Temas */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Palette className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalThemes}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-blue-100 font-semibold tracking-wide">TEMAS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Total de Temas</h3>
                <p className="text-blue-100 text-sm font-medium">Disponíveis no sistema</p>
              </div>
            </div>
          </div>

          {/* Card Usuários Ativos */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-green-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-green-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-teal-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Eye className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.activeUsers.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-green-100 font-semibold tracking-wide">USUÁRIOS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Usuários Ativos</h3>
                <p className="text-green-100 text-sm font-medium">Usando temas personalizados</p>
              </div>
            </div>
          </div>

          {/* Card Personalizações */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-purple-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Brush className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.customizations}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-purple-100 font-semibold tracking-wide">CUSTOM</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Personalizações</h3>
                <p className="text-purple-100 text-sm font-medium">Criadas pelos usuários</p>
              </div>
            </div>
          </div>

          {/* Card Satisfação */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-amber-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-amber-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Heart className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.satisfaction}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-amber-100 font-semibold tracking-wide">SATISFAÇÃO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Satisfação</h3>
                <p className="text-amber-100 text-sm font-medium">Com a experiência visual</p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda linha de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Visualizações Responsivas */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-cyan-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-cyan-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-indigo-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Monitor className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.responsiveViews}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-cyan-100 font-semibold tracking-wide">RESPONSIVO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Responsividade</h3>
                <p className="text-cyan-100 text-sm font-medium">Compatibilidade dispositivos</p>
              </div>
            </div>
          </div>

          {/* Card Modo Escuro */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-slate-600 via-gray-700 to-zinc-800 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-slate-400 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-slate-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-gray-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-zinc-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Moon className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.darkModeUsage}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-slate-100 font-semibold tracking-wide">DARK MODE</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Modo Escuro</h3>
                <p className="text-slate-100 text-sm font-medium">Preferência dos usuários</p>
              </div>
            </div>
          </div>

          {/* Card Mobile */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-rose-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-rose-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-pink-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Smartphone className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.mobileOptimization}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-rose-100 font-semibold tracking-wide">MOBILE</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Mobile</h3>
                <p className="text-rose-100 text-sm font-medium">Otimização mobile</p>
              </div>
            </div>
          </div>

          {/* Card Acessibilidade */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-emerald-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-emerald-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-green-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-teal-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.accessibilityScore}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-emerald-100 font-semibold tracking-wide">A11Y</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Acessibilidade</h3>
                <p className="text-emerald-100 text-sm font-medium">Score de inclusividade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de demonstração de temas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎨 Galeria de Temas</h2>
          <p className="text-gray-600 mb-6">
            Explore nossa coleção de temas premium com design moderno e funcionalidades avançadas.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sun className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-blue-800">Tema Claro</h3>
              </div>
              <p className="text-blue-600 text-sm mb-4">Interface limpa e moderna para uso durante o dia</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                  <Moon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-100">Tema Escuro</h3>
              </div>
              <p className="text-gray-300 text-sm mb-4">Reduz fadiga ocular em ambientes com pouca luz</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-700 rounded-full"></div>
                <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Stars className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-purple-800">Tema Premium</h3>
              </div>
              <p className="text-purple-600 text-sm mb-4">Design exclusivo com animações e efeitos especiais</p>
              <div className="flex gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                <div className="w-4 h-4 bg-violet-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
} 
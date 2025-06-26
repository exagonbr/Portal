'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity,
  Award,
  Target,
  Zap,
  Globe,
  Heart,
  Star,
  Rocket,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';

export default function ModernDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 2847,
    engagement: 94.2,
    performance: 87.5,
    satisfaction: 96.1,
    growth: 15.3,
    efficiency: 92.8,
    innovation: 88.4,
    quality: 95.7
  });

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DashboardPageLayout
      title="Dashboard Moderno"
      subtitle="Interface premium com design avançado"
    >
      <div className="space-y-8">
        {/* Cards de Estatísticas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Total de Usuários */}
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
                  <Users className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalUsers.toLocaleString()}</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-blue-100 font-semibold tracking-wide">USUÁRIOS</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Total de Usuários</h3>
                <p className="text-blue-100 text-sm font-medium">Comunidade ativa</p>
              </div>
            </div>
          </div>

          {/* Card Engajamento */}
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
                  <Heart className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.engagement}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-green-100 font-semibold tracking-wide">ENGAJAMENTO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Engajamento</h3>
                <p className="text-green-100 text-sm font-medium">Taxa de participação</p>
              </div>
            </div>
          </div>

          {/* Card Performance */}
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
                  <TrendingUp className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.performance}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-purple-100 font-semibold tracking-wide">PERFORMANCE</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Performance</h3>
                <p className="text-purple-100 text-sm font-medium">Índice geral</p>
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
                  <Star className="w-7 h-7 text-white drop-shadow-lg" />
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
                <p className="text-amber-100 text-sm font-medium">Avaliação dos usuários</p>
              </div>
            </div>
          </div>
        </div>

        {/* Segunda linha de cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card Crescimento */}
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
                  <Rocket className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">+{stats.growth}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-cyan-100 font-semibold tracking-wide">CRESCIMENTO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Crescimento</h3>
                <p className="text-cyan-100 text-sm font-medium">Este mês</p>
              </div>
            </div>
          </div>

          {/* Card Eficiência */}
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
                  <Zap className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.efficiency}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-emerald-100 font-semibold tracking-wide">EFICIÊNCIA</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Eficiência</h3>
                <p className="text-emerald-100 text-sm font-medium">Operacional</p>
              </div>
            </div>
          </div>

          {/* Card Inovação */}
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
                  <Target className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.innovation}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-rose-100 font-semibold tracking-wide">INOVAÇÃO</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Inovação</h3>
                <p className="text-rose-100 text-sm font-medium">Índice de criatividade</p>
              </div>
            </div>
          </div>

          {/* Card Qualidade */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-violet-300 transform hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-12 w-1 h-1 bg-violet-200 rounded-full animate-ping"></div>
              <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-purple-200 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-12 right-8 w-1 h-1 bg-indigo-200 rounded-full animate-ping delay-500"></div>
            </div>
            <div className="relative p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                  <Award className="w-7 h-7 text-white drop-shadow-lg" />
                </div>
                <div className="text-right">
                  <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.quality}%</p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg"></div>
                    <span className="text-sm text-violet-100 font-semibold tracking-wide">QUALIDADE</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Qualidade</h3>
                <p className="text-violet-100 text-sm font-medium">Padrão de excelência</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de conteúdo adicional */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Moderno</h2>
          <p className="text-gray-600 mb-6">
            Esta é uma demonstração do novo design premium com cards animados, gradientes vibrantes e efeitos visuais avançados.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Design Premium</h3>
              <p className="text-blue-600 text-sm">Cards com gradientes e animações sofisticadas</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
              <h3 className="font-semibold text-green-800 mb-2">Interatividade</h3>
              <p className="text-green-600 text-sm">Efeitos de hover e transições suaves</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">Visual Moderno</h3>
              <p className="text-purple-600 text-sm">Interface contemporânea e atrativa</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  );
} 
'use client'

import React, { useState, useEffect } from 'react'
import { useSystemSettings } from '../../../hooks/useSystemSettings'
import { systemSettingsService, SystemSettingItem, SystemSettingsStats } from '../../../services/systemSettingsService'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface SystemSettingsProps {
  filterCategory?: string | null;
}

// Definição das categorias e suas cores
const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-blue-100 text-blue-800',
  appearance: 'bg-purple-100 text-purple-800',
  aws: 'bg-orange-100 text-orange-800',
  email: 'bg-green-100 text-green-800',
  notifications: 'bg-yellow-100 text-yellow-800',
  security: 'bg-red-100 text-red-800'
}

// Cores para o gráfico
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#22c55e', '#eab308', '#ef4444'];

// Função para determinar o tipo do valor
function getValueType(value: any): string {
  if (value === null || value === undefined) return 'null'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  return typeof value
}

// Componente para exibir as configurações do sistema
export default function SystemSettingsAnalytics({ filterCategory = null }: SystemSettingsProps) {
  const { settings, loading: hookLoading } = useSystemSettings()
  const [activeCategory, setActiveCategory] = useState<string | null>(filterCategory)
  const [searchTerm, setSearchTerm] = useState('')
  const [settingsData, setSettingsData] = useState<SystemSettingItem[]>([])
  const [statsData, setStatsData] = useState<SystemSettingsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados das configurações do sistema
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Buscar configurações e estatísticas em paralelo
        const [settingsResponse, statsResponse] = await Promise.all([
          systemSettingsService.getAllSettings(),
          systemSettingsService.getSettingsStats()
        ]);
        
        setSettingsData(settingsResponse);
        setStatsData(statsResponse);
      } catch (err) {
        console.error('Erro ao carregar configurações do sistema:', err);
        setError('Falha ao carregar dados das configurações do sistema.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  // Filtrar as configurações com base na categoria ativa e no termo de pesquisa
  const filteredSettings = settingsData.filter(setting => {
    const matchesCategory = !activeCategory || setting.category === activeCategory
    const matchesSearch = !searchTerm || 
      setting.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
      setting.value.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Agrupar configurações por categoria para exibição
  const settingsByCategory = filteredSettings.reduce<Record<string, typeof filteredSettings>>((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {})

  // Lista de todas as categorias disponíveis
  const categories = Object.keys(settingsByCategory).sort()

  // Preparar dados para o gráfico de categorias
  const categoryChartData = statsData ? Object.entries(statsData.categoryCounts).map(([name, value], index) => ({
    name,
    value,
    color: CHART_COLORS[index % CHART_COLORS.length]
  })) : [];

  // Preparar dados para o gráfico de visibilidade
  const visibilityChartData = statsData ? [
    { name: 'Público', value: statsData.publicCount, color: '#22c55e' },
    { name: 'Privado', value: statsData.privateCount, color: '#ef4444' },
  ] : [];

  if (loading || hookLoading) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Configurações do Sistema</h3>
        
        {/* Estatísticas rápidas */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Configurações</h4>
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{statsData.totalCount}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-700 dark:text-green-300">Configurações Públicas</h4>
              <p className="text-2xl font-bold text-green-800 dark:text-green-200">{statsData.publicCount}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Configurações Criptografadas</h4>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{statsData.encryptedCount}</p>
            </div>
          </div>
        )}

        {/* Gráficos */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distribuição por Categoria</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} configurações`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visibilidade das Configurações</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visibilityChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {visibilityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} configurações`, 'Quantidade']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        
        {/* Barra de pesquisa e filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Buscar configurações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-3 py-1 text-sm rounded-md ${!activeCategory ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
              onClick={() => setActiveCategory(null)}
            >
              Todas
            </button>
            {categories.map(category => (
              <button
                key={category}
                className={`px-3 py-1 text-sm rounded-md ${activeCategory === category ? CATEGORY_COLORS[category] || 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setActiveCategory(category === activeCategory ? null : category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de configurações */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Chave
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoria
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Visibilidade
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSettings.map((setting) => (
                <tr key={setting.key} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {setting.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {setting.value && setting.value.length > 30 ? `${setting.value.substring(0, 30)}...` : setting.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${CATEGORY_COLORS[setting.category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {setting.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {setting.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {setting.is_public ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Público
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Privado
                      </span>
                    )}
                    {setting.is_encrypted && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Criptografado
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSettings.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Nenhuma configuração encontrada.
          </div>
        )}
      </div>
    </div>
  )
} 
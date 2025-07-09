'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Edit, Trash2, Eye, Building2, CheckCircle, XCircle, MapPin, RefreshCw } from 'lucide-react'

// Interfaces básicas
interface Unit {
  id: string
  name: string
  code?: string
  address?: string
  city?: string
  state?: string
  status: 'active' | 'inactive'
  course_id?: number
  created_at?: string
  updated_at?: string
}

// Componente de Loading simples
const SimpleLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">Carregando unidades...</span>
  </div>
)

// Componente de Badge simples
const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'danger' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  )
}

// Componente de Button simples
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]} ${sizes[size]} 
        rounded-lg font-medium transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export default function ManageUnits() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<Unit[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([])
  const [error, setError] = useState<string | null>(null)

  // Mock data para teste
  const mockUnits: Unit[] = [
    {
      id: '1',
      name: 'Unidade Centro',
      code: 'UC001',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      status: 'active',
      course_id: 1
    },
    {
      id: '2',
      name: 'Unidade Norte',
      code: 'UN002',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      status: 'active'
    },
    {
      id: '3',
      name: 'Unidade Sul',
      code: 'US003',
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      status: 'inactive',
      course_id: 2
    }
  ]

  // Função para carregar unidades
  const loadUnits = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simular uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Por enquanto usando dados mock
      setUnits(mockUnits)
      setFilteredUnits(mockUnits)
      
    } catch (err) {
      console.error('Erro ao carregar unidades:', err)
      setError('Erro ao carregar unidades. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função de busca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setFilteredUnits(units)
    } else {
      const filtered = units.filter(unit => 
        unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        unit.city?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUnits(filtered)
    }
  }

  // Função para deletar unidade
  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Tem certeza que deseja excluir a unidade "${unit.name}"?`)) {
      return
    }
    
    try {
      // Simular exclusão
      const updatedUnits = units.filter(u => u.id !== unit.id)
      setUnits(updatedUnits)
      setFilteredUnits(updatedUnits.filter(u => 
        !searchQuery.trim() || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.city?.toLowerCase().includes(searchQuery.toLowerCase())
      ))
      alert('Unidade excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir unidade:', err)
      alert('Erro ao excluir unidade.')
    }
  }

  // Carregar dados no mount
  useEffect(() => {
    loadUnits()
  }, [])

  // Função para obter label do status
  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo'
  }

  // Função para obter variante do badge do status
  const getStatusVariant = (status: string): 'success' | 'danger' => {
    return status === 'active' ? 'success' : 'danger'
  }

  if (loading) {
    return <SimpleLoading />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Erro</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUnits} variant="danger">
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Unidades de Ensino</h1>
              <p className="text-gray-600 mt-1">Gerencie as unidades de ensino do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={loadUnits} variant="ghost">
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </Button>
              <Button onClick={() => alert('Funcionalidade em desenvolvimento')}>
                <Plus className="w-4 h-4" />
                Nova Unidade
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-blue-600 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-900">{units.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-green-600 text-sm font-medium">Ativas</p>
                  <p className="text-2xl font-bold text-green-900">
                    {units.filter(u => u.status === 'active').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-purple-600 text-sm font-medium">Com Curso</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {units.filter(u => u.course_id).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar unidade..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="ghost">
              Buscar
            </Button>
          </form>
        </div>

        {/* Content */}
        <div className="p-6">
          {filteredUnits.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhuma unidade encontrada</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "Tente ajustar sua busca." : "Clique em \"Nova Unidade\" para adicionar a primeira"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unidade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                            <div className="text-xs text-gray-500">{unit.code || 'Sem código'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {unit.city && unit.state ? `${unit.city}, ${unit.state}` : 'Não informado'}
                        </div>
                        {unit.address && (
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {unit.address}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {unit.course_id ? 'Com Curso' : 'Sem Curso'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={getStatusVariant(unit.status)}>
                          {getStatusLabel(unit.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => alert(`Visualizar ${unit.name}`)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => alert(`Editar ${unit.name}`)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(unit)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


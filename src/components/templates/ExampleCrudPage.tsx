'use client'

import React, { useState, useCallback } from 'react'
import { Building2, Users, CheckCircle, School, Eye, Edit, Trash2 } from 'lucide-react'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import AdminCrudPageTemplate from './AdminCrudPageTemplate'
import DataTable, { useTableColumns } from './DataTable'
import { useToast } from '@/components/ToastManager'

// Dados de exemplo (normalmente viriam de um serviço)
const exampleData = [
  {
    id: '1',
    name: 'Escola Municipal São José',
    type: 'Pública',
    city: 'São Paulo',
    state: 'SP',
    is_active: true,
    schools_count: 5,
    users_count: 150,
    created_at: '2023-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Colégio Particular ABC',
    type: 'Privada',
    city: 'Rio de Janeiro',
    state: 'RJ',
    is_active: true,
    schools_count: 3,
    users_count: 89,
    created_at: '2023-02-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Centro Educacional XYZ',
    type: 'Mista',
    city: 'Belo Horizonte',
    state: 'MG',
    is_active: false,
    schools_count: 1,
    users_count: 25,
    created_at: '2023-03-10T00:00:00Z'
  }
]

export default function ExampleCrudPage() {
  const { showSuccess, showError } = useToast()
  const { createColumn, statusColumn, dateColumn, countColumn } = useTableColumns()
  
  // Estados
  const [data, setData] = useState(exampleData)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})

  // Estatísticas calculadas
  const stats = [
    {
      icon: Building2,
      title: 'Total',
      value: data.length,
      subtitle: 'Instituições',
      color: 'blue' as const
    },
    {
      icon: CheckCircle,
      title: 'Ativas',
      value: data.filter(item => item.is_active).length,
      subtitle: 'Funcionando',
      color: 'green' as const
    },
    {
      icon: School,
      title: 'Escolas',
      value: data.reduce((acc, item) => acc + item.schools_count, 0),
      subtitle: 'Unidades',
      color: 'purple' as const
    },
    {
      icon: Users,
      title: 'Usuários',
      value: data.reduce((acc, item) => acc + item.users_count, 0),
      subtitle: 'Total',
      color: 'amber' as const
    }
  ]

  // Configuração das colunas da tabela
  const columns = [
    createColumn('name', 'Instituição', {
      render: (value, item) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">ID: {item.id}</div>
          </div>
        </div>
      )
    }),
    createColumn('type', 'Tipo'),
    countColumn('schools_count', 'Escolas', 'blue'),
    countColumn('users_count', 'Usuários', 'green'),
    createColumn('location', 'Localização', {
      render: (_, item) => (
        <div>
          <div>{item.city}</div>
          <div className="text-xs text-gray-500">{item.state}</div>
        </div>
      )
    }),
    statusColumn('is_active'),
    dateColumn('created_at', 'Criado em')
  ]

  // Ações da tabela
  const actions = [
    {
      label: 'Visualizar',
      icon: Eye,
      onClick: (item: any) => handleView(item),
      variant: 'ghost' as const,
      className: 'text-blue-600 hover:text-blue-900'
    },
    {
      label: 'Editar',
      icon: Edit,
      onClick: (item: any) => handleEdit(item),
      variant: 'ghost' as const,
      className: 'text-green-600 hover:text-green-900'
    },
    {
      label: 'Excluir',
      icon: Trash2,
      onClick: (item: any) => handleDelete(item),
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-900'
    }
  ]

  // Campos de filtro
  const filterFields = [
    {
      key: 'type',
      label: 'Tipo',
      type: 'select' as const,
      options: [
        { label: 'Pública', value: 'Pública' },
        { label: 'Privada', value: 'Privada' },
        { label: 'Mista', value: 'Mista' }
      ]
    },
    {
      key: 'state',
      label: 'Estado',
      type: 'select' as const,
      options: [
        { label: 'São Paulo', value: 'SP' },
        { label: 'Rio de Janeiro', value: 'RJ' },
        { label: 'Minas Gerais', value: 'MG' }
      ]
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'boolean' as const
    }
  ]

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    // Simular chamada de API
    setTimeout(() => {
      setRefreshing(false)
      showSuccess('Lista atualizada com sucesso!')
    }, 1000)
  }, [showSuccess])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    // Implementar lógica de busca
    console.log('Buscar por:', searchQuery)
  }, [searchQuery])

  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }))
  }, [])

  const handleApplyFilters = useCallback(() => {
    // Implementar lógica de aplicação de filtros
    console.log('Aplicar filtros:', filters)
    setShowFilterPanel(false)
    showSuccess('Filtros aplicados!')
  }, [filters, showSuccess])

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setShowFilterPanel(false)
    showSuccess('Filtros limpos!')
  }, [showSuccess])

  const handleCreateNew = useCallback(() => {
    console.log('Criar nova instituição')
    showSuccess('Modal de criação aberto!')
  }, [showSuccess])

  const handleView = useCallback((item: any) => {
    console.log('Visualizar:', item)
    showSuccess(`Visualizando ${item.name}`)
  }, [showSuccess])

  const handleEdit = useCallback((item: any) => {
    console.log('Editar:', item)
    showSuccess(`Editando ${item.name}`)
  }, [showSuccess])

  const handleDelete = useCallback((item: any) => {
    if (confirm(`Tem certeza que deseja excluir ${item.name}?`)) {
      setData(prev => prev.filter(d => d.id !== item.id))
      showSuccess(`${item.name} excluída com sucesso!`)
    }
  }, [showSuccess])

  // Dados filtrados (simulação simples)
  const filteredData = data.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    
    for (const [key, value] of Object.entries(filters)) {
      if (value && item[key as keyof typeof item] !== value) {
        return false
      }
    }
    
    return true
  })

  return (
    <AuthenticatedLayout>
      <AdminCrudPageTemplate
        title="Exemplo de Página CRUD"
        subtitle="Demonstração dos padrões de layout do sistema"
        stats={stats}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        searchPlaceholder="Buscar instituição..."
        showFilterPanel={showFilterPanel}
        onToggleFilterPanel={() => setShowFilterPanel(!showFilterPanel)}
        filterFields={filterFields}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onCreateNew={handleCreateNew}
        createButtonLabel="Nova Instituição"
        pagination={{
          currentPage: 1,
          totalPages: 1,
          totalItems: filteredData.length,
          itemsPerPage: 10
        }}
      >
        <DataTable
          data={filteredData}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyStateIcon={Building2}
          emptyStateTitle="Nenhuma instituição encontrada"
          emptyStateMessage="Clique em 'Nova Instituição' para adicionar a primeira"
          onRowClick={(item) => console.log('Clicou na linha:', item)}
        />
      </AdminCrudPageTemplate>
    </AuthenticatedLayout>
  )
} 
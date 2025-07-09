'use client'

import { useEffect, useState } from 'react'
import { ThemeDto, ThemeFilter } from '@/types/theme'
import { themeService } from '@/services/themeService'
import { useToast } from '@/hooks/useToast'
import GenericCRUD from '@/components/crud/GenericCRUD'
import ThemeForm from './components/ThemeForm'
import { PaginatedResponse } from '@/types/api'

// Componente Card simples que não depende do ThemeContext
const SimpleCard = ({ className = '', children }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeDto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const toast = useToast()

  const fetchThemes = async (page = 1, search = '') => {
    setLoading(true)
    try {
      const filters: ThemeFilter = {
        page,
        limit: itemsPerPage,
      }
      
      if (search) {
        filters.search = search
      }
      
      const response: PaginatedResponse<ThemeDto> = await themeService.getThemes(filters)
      setThemes(response.items)
      setTotalItems(response.total)
      setCurrentPage(page)
    } catch (error) {
      console.error('Erro ao buscar temas:', error)
      toast.showError('Não foi possível carregar os temas. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThemes(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
    fetchThemes(1, term)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCreate = () => {
    setCurrentTheme(null)
    setIsFormOpen(true)
  }

  const handleEdit = (theme: ThemeDto) => {
    setCurrentTheme(theme)
    setIsFormOpen(true)
  }

  const handleDelete = async (theme: ThemeDto) => {
    try {
      await themeService.deleteTheme(Number(theme.id))
      toast.showSuccess(`Tema "${theme.name}" excluído com sucesso!`)
      fetchThemes(currentPage, searchTerm)
    } catch (error) {
      console.error('Erro ao excluir tema:', error)
      toast.showError('Não foi possível excluir o tema. Tente novamente mais tarde.')
    }
  }

  const handleToggleStatus = async (theme: ThemeDto) => {
    try {
      await themeService.toggleThemeStatus(Number(theme.id))
      toast.showSuccess(`Status do tema "${theme.name}" alterado com sucesso!`)
      fetchThemes(currentPage, searchTerm)
    } catch (error) {
      console.error('Erro ao alterar status do tema:', error)
      toast.showError('Não foi possível alterar o status do tema. Tente novamente mais tarde.')
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      if (currentTheme) {
        await themeService.updateTheme(Number(currentTheme.id), data)
        toast.showSuccess(`Tema "${data.name}" atualizado com sucesso!`)
      } else {
        await themeService.createTheme(data)
        toast.showSuccess(`Tema "${data.name}" criado com sucesso!`)
      }
      setIsFormOpen(false)
      fetchThemes(currentPage, searchTerm)
    } catch (error) {
      console.error('Erro ao salvar tema:', error)
      toast.showError('Não foi possível salvar o tema. Tente novamente mais tarde.')
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const columns = [
    { key: 'name', label: 'Nome', sortable: true },
    { key: 'description', label: 'Descrição', sortable: false },
    { 
      key: 'is_active', 
      label: 'Status', 
      sortable: true,
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      )
    },
  ]

  const customActions = [
    {
      icon: <span className="material-symbols-outlined">power_settings_new</span>,
      label: 'Alterar Status',
      onClick: handleToggleStatus,
      variant: 'ghost' as const,
      className: (theme: ThemeDto) => theme.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'
    }
  ]

  return (
    <div className="container mx-auto p-4">
      <SimpleCard className="p-6">
        <GenericCRUD
          title="Gerenciamento de Temas"
          entityName="Tema"
          entityNamePlural="Temas"
          columns={columns}
          data={themes}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onSearch={handleSearch}
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
          customActions={customActions}
          searchPlaceholder="Buscar temas..."
          emptyMessage="Nenhum tema encontrado"
        />
      </SimpleCard>

      {isFormOpen && (
        <ThemeForm
          theme={currentTheme}
          isOpen={isFormOpen}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
} 
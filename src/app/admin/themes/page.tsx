'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { themeService } from '@/services/themeService'
import { ThemeDto } from '@/types/theme'
import { useToast } from '@/components/ToastManager'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, Settings, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react'
import { StatCard } from '@/components/ui/StandardCard'
import Modal from '@/components/ui/Modal'
import ThemeForm from './components/ThemeForm'

// Interface para estatísticas dos temas
interface ThemeStats {
  totalThemes: number
  activeThemes: number
  inactiveThemes: number
  recentThemes: number
}

export default function ManageThemes() {
  const router = useRouter()
  const { showSuccess, showError, showWarning } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view')
  const [modalTheme, setModalTheme] = useState<ThemeDto | null>(null)

  const fetcher = () => themeService.getThemes({ 
    page: currentPage, 
    limit: itemsPerPage, 
    search: searchQuery || undefined 
  })
  
  const { data, error, isLoading, mutate, isValidating } = useSWR(
    `/api/themes?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
    fetcher
  )

  const themes = data?.items || []
  const totalItems = data?.total || 0
  
  // Calcular estatísticas
  const stats: ThemeStats = {
    totalThemes: themes.length,
    activeThemes: themes.filter(theme => theme.is_active).length,
    inactiveThemes: themes.filter(theme => !theme.is_active).length,
    recentThemes: themes.filter(theme => {
      if (!theme.created_at) return false
      const created = new Date(theme.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return created > thirtyDaysAgo
    }).length
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    mutate()
  }

  const handleRefresh = () => {
    mutate()
  }

  const handleDeleteTheme = async (theme: ThemeDto) => {
    const confirmMessage = `Tem certeza que deseja excluir o tema "${theme.name}"?\n\nEsta ação não pode ser desfeita.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      setLoading(true)
      await themeService.deleteTheme(Number(theme.id))
      showSuccess("Tema excluído", "O tema foi excluído com sucesso.")
      
      // Recarregar a lista
      await mutate()
    } catch (error) {
      console.error('❌ Erro ao excluir tema:', error)
      showError("Erro ao excluir tema", "Não foi possível excluir o tema.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (theme: ThemeDto) => {
    try {
      setLoading(true)
      const updatedTheme = await themeService.toggleThemeStatus(Number(theme.id))
      
      const statusText = updatedTheme.is_active ? 'ativado' : 'desativado'
      showSuccess("Status alterado", `Tema ${statusText} com sucesso!`)
      
      // Recarregar dados
      await mutate()
      
    } catch (error) {
      console.error('❌ Erro ao alterar status do tema:', error)
      showError("Erro ao alterar status", "Não foi possível alterar o status do tema.")
    } finally {
      setLoading(false)
    }
  }

  // Funções para o modal
  const openModal = (mode: 'view' | 'create' | 'edit', theme?: ThemeDto) => {
    setModalMode(mode)
    setModalTheme(theme || null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalTheme(null)
  }

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true)
      
      if (modalMode === 'create') {
        const newTheme = await themeService.createTheme(data)
        showSuccess("Sucesso", "Tema criado com sucesso!")
        console.log('✅ Novo tema criado:', newTheme)
        
      } else if (modalMode === 'edit' && modalTheme) {
        const updatedTheme = await themeService.updateTheme(Number(modalTheme.id), data)
        showSuccess("Sucesso", "Tema atualizado com sucesso!")
        console.log('✅ Tema atualizado:', updatedTheme)
      }
      
      closeModal()
      
      // Recarregar a lista
      await mutate()
    } catch (error) {
      console.error('❌ Erro ao salvar tema:', error)
      showError("Erro ao salvar tema", "Não foi possível salvar o tema.")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header Simplificado */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Temas</h1>
              <p className="text-gray-600 mt-1">Gerencie os temas do sistema</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={isValidating}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Tema
              </Button>
            </div>
          </div>

          {/* Stats Cards Compactos */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Settings}
              title="Total"
              value={stats.totalThemes}
              subtitle="Temas"
              color="blue"
            />
            <StatCard
              icon={CheckCircle}
              title="Ativos"
              value={stats.activeThemes}
              subtitle="Funcionando"
              color="green"
            />
            <StatCard
              icon={AlertTriangle}
              title="Inativos"
              value={stats.inactiveThemes}
              subtitle="Desabilitados"
              color="red"
            />
            <StatCard
              icon={Plus}
              title="Recentes"
              value={stats.recentThemes}
              subtitle="Últimos 30 dias"
              color="purple"
            />
          </div>

          {/* Search Simplificado */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar tema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>

        {/* Content */}
        <div>
          {loading || isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-500 text-lg mb-2">Erro ao carregar dados</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum tema encontrado</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "Tente ajustar sua busca" : "Clique em \"Novo Tema\" para adicionar o primeiro"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table - Simplificada */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Criado em
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {themes.map((theme) => (
                      <tr key={theme.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Settings className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">{theme.description || 'Sem descrição'}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(theme)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              theme.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {theme.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {theme.created_at ? new Date(theme.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', theme)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', theme)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTheme(theme)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards para Mobile/Tablet */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {themes.map((theme) => (
                    <div key={theme.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {/* Header do Card */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Settings className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{theme.name}</h3>
                              <div className="text-xs text-gray-500 mt-1">
                                {theme.created_at ? new Date(theme.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(theme)}
                            className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              theme.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {theme.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </div>
                      </div>

                      {/* Body do Card */}
                      <div className="p-4">
                        {/* Descrição */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">{theme.description || 'Sem descrição'}</p>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('view', theme)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('edit', theme)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTheme(theme)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={closeModal}
          title={
            modalMode === 'view' ? 'Visualizar Tema' :
            modalMode === 'edit' ? 'Editar Tema' : 
            'Novo Tema'
          }
          size="md"
        >
          {modalMode === 'view' && modalTheme ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <p className="text-sm text-gray-900">{modalTheme.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <p className="text-sm text-gray-900">{modalTheme.description || 'Sem descrição'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  modalTheme.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {modalTheme.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Criado em</label>
                <p className="text-sm text-gray-900">
                  {modalTheme.created_at ? new Date(modalTheme.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={closeModal}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setModalMode('edit')
                }}>
                  Editar
                </Button>
              </div>
            </div>
          ) : (
            <ThemeForm
              theme={modalTheme}
              isOpen={modalOpen}
              onSubmit={handleModalSave}
              onCancel={closeModal}
            />
          )}
        </Modal>
      )}
    </div>
  )
} 
'use client'

import { useEffect, useState } from 'react'
import { ThemeDto, ThemeFilter } from '@/types/theme'
import { themeService } from '@/services/themeService'
import { useToast } from '@/components/ToastManager'
import { Button } from '@/components/ui/Button'
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, Settings } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import ThemeForm from './components/ThemeForm'
import { PaginatedResponse } from '@/types/api'

// Componente Card simples que não depende do ThemeContext
const SimpleCard = ({ className = '', children }: { className?: string; children: React.ReactNode }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  )
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<ThemeDto[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<ThemeDto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const { showSuccess, showError } = useToast()

  const fetchThemes = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      console.log('🔄 [THEMES] Carregando temas...', { page, search, limit: itemsPerPage });
      
      const filters: ThemeFilter = {
        page,
        limit: itemsPerPage,
      }
      
      if (search && search.trim()) {
        filters.search = search.trim();
      }
      
      const response: PaginatedResponse<ThemeDto> = await themeService.getThemes(filters)
      
      console.log('✅ [THEMES] Resposta do serviço de temas:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
      });
      
      // Verificar se a resposta tem o formato esperado
      if (!response || !Array.isArray(response.items)) {
        console.error('❌ [THEMES] Formato de resposta inválido:', response);
        throw new Error('Formato de resposta inválido do servidor');
      }
      
      setThemes(response.items)
      setTotalItems(response.total || 0)
      setCurrentPage(response.page || page)
      
      if (!showLoadingIndicator) {
        showSuccess("Lista de temas atualizada com sucesso!")
      }
      
      console.log('✅ [THEMES] Temas carregados com sucesso:', response.items.length);
    } catch (error: any) {
      console.error('❌ [THEMES] Erro ao carregar temas:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError(`Erro ao carregar temas: ${errorMessage}`);
      
      // Em caso de erro, limpar dados para evitar inconsistências
      setThemes([]);
      setTotalItems(0);
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchThemes(currentPage, searchTerm)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchThemes(1, searchTerm)
  }

  const handleRefresh = () => {
    fetchThemes(currentPage, searchTerm, false)
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
    const confirmMessage = `Tem certeza que deseja excluir o tema "${theme.name}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true)
      console.log('🗑️ [THEMES] Excluindo tema:', theme.id);
      
      await themeService.deleteTheme(Number(theme.id))
      console.log('✅ [THEMES] Tema excluído com sucesso');
      
      showSuccess(`Tema "${theme.name}" excluído com sucesso!`)
      fetchThemes(currentPage, searchTerm, false)
    } catch (error: any) {
      console.error('❌ [THEMES] Erro ao excluir tema:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError(`Erro ao excluir tema: ${errorMessage}`);
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (theme: ThemeDto) => {
    try {
      setLoading(true)
      console.log('🔄 [THEMES] Alterando status do tema:', theme.id, 'atual:', theme.is_active);
      
      const updatedTheme = await themeService.toggleThemeStatus(Number(theme.id))
      console.log('✅ [THEMES] Status alterado:', updatedTheme);
      
      const statusText = updatedTheme.is_active ? 'ativado' : 'desativado';
      showSuccess(`Tema "${theme.name}" ${statusText} com sucesso!`)
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      setThemes(prevThemes =>
        prevThemes.map(th =>
          th.id === theme.id
            ? { ...th, is_active: updatedTheme.is_active }
            : th
        )
      );
    } catch (error: any) {
      console.error('❌ [THEMES] Erro ao alterar status do tema:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError(`Erro ao alterar status: ${errorMessage}`);
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setLoading(true)
      console.log('💾 [THEMES] Salvando tema...', { mode: currentTheme ? 'edit' : 'create', data });
      
      if (currentTheme) {
        const updatedTheme = await themeService.updateTheme(Number(currentTheme.id), data)
        console.log('✅ [THEMES] Tema atualizado:', updatedTheme);
        showSuccess(`Tema "${data.name}" atualizado com sucesso!`)
      } else {
        const newTheme = await themeService.createTheme(data)
        console.log('✅ [THEMES] Tema criado:', newTheme);
        showSuccess(`Tema "${data.name}" criado com sucesso!`)
      }
      setIsFormOpen(false)
      fetchThemes(currentPage, searchTerm, false)
    } catch (error: any) {
      console.error('❌ [THEMES] Erro ao salvar tema:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada. Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError(`Erro ao salvar tema: ${errorMessage}`);
    } finally {
      setLoading(false)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
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
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={handleCreate} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Tema
              </Button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar tema..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando temas...</span>
            </div>
          ) : themes.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum tema encontrado</p>
              <p className="text-gray-400 text-sm">
                {searchTerm ? "Tente ajustar sua busca ou limpar o filtro." : "Clique em \"Novo Tema\" para adicionar o primeiro"}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
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
                          <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">{theme.description || 'N/A'}</div>
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
                              onClick={() => handleEdit(theme)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(theme)}
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
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{theme.name}</h3>
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

                        {/* Data de criação */}
                        <div className="flex items-center mb-4">
                          <span className="text-xs text-gray-500">
                            Criado em: {theme.created_at ? new Date(theme.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(theme)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(theme)}
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
      {isFormOpen && (
        <Modal
          isOpen={isFormOpen}
          onClose={handleFormCancel}
          title={
            currentTheme 
              ? 'Editar Tema' 
              : 'Novo Tema'
          }
          size="md"
        >
          <ThemeForm
            theme={currentTheme}
            isOpen={isFormOpen}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </Modal>
      )}
    </div>
  )
} 
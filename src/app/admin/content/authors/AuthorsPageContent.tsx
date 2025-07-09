'use client';

import { useState, useEffect, useCallback } from 'react';
import { authorService } from '@/services/authorService';
import { AuthorDto, AuthorFilter } from '@/types/author';
import { useToast } from '@/components/ToastManager';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StandardCard';
import Modal from '@/components/ui/Modal';
import AuthorForm from '@/components/forms/AuthorForm';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  User,
  Users,
  UserCheck,
  BookOpen,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

// Interface para estatísticas dos autores
interface AuthorStats {
  totalAuthors: number;
  activeAuthors: number;
  inactiveAuthors: number;
  authorsWithBio: number;
}

// Interface para filtros
interface AuthorFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
}

export default function AuthorsPageContent() {
  const { showSuccess, showError, showWarning } = useToast();
  
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState<AuthorFilters>({});
  
  // Estados do modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorDto | null>(null);
  
  // Estados de estatísticas
  const [stats, setStats] = useState<AuthorStats>({
    totalAuthors: 0,
    activeAuthors: 0,
    inactiveAuthors: 0,
    authorsWithBio: 0
  });

  // Função para calcular estatísticas
  const calculateStats = useCallback((authorList: AuthorDto[]): AuthorStats => {
    const totalAuthors = totalItems || authorList.length;
    const activeAuthors = authorList.filter(author => author.is_active).length;
    const inactiveAuthors = authorList.filter(author => !author.is_active).length;
    const authorsWithBio = authorList.filter(author => author.description && author.description.trim()).length;

    return { totalAuthors, activeAuthors, inactiveAuthors, authorsWithBio };
  }, [totalItems]);

  // Função para carregar autores
  const loadAuthors = useCallback(async (page = 1, search = '', authorFilters: AuthorFilters = {}, showLoadingIndicator = true) => {
    try {
      if (showLoadingIndicator) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const params: AuthorFilter = {
        page,
        limit: itemsPerPage,
        search: search || undefined,
        ...authorFilters,
      };

      console.log('🔄 [AUTHORS] Carregando autores com parâmetros:', params);
      
      const response = await authorService.getAuthors(params);
      
      console.log('✅ [AUTHORS] Autores carregados:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page
      });
      
      setAuthors(response.items || []);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
      setSearchQuery(search);
      setFilters(authorFilters);

      // Calcular estatísticas
      const newStats = calculateStats(response.items || []);
      setStats(newStats);

      if (!showLoadingIndicator) {
        showSuccess("Lista de autores atualizada com sucesso!");
      }
      
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao carregar autores:', error);
      
      const errorMessage = error.message || "Erro ao carregar autores. Verifique sua conexão e tente novamente.";
      
      setAuthors([]);
      setTotalItems(0);
      
      showError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateStats, showSuccess, showError]);

  // Inicialização
  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  // Recalcular estatísticas quando autores mudarem
  useEffect(() => {
    if (authors.length > 0) {
      const newStats = calculateStats(authors);
      setStats(newStats);
    }
  }, [authors, calculateStats]);

  // Handlers de eventos
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadAuthors(1, searchQuery, filters);
  };

  const handleFilterChange = (key: keyof AuthorFilters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadAuthors(1, searchQuery, filters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setShowFilterPanel(false);
    setCurrentPage(1);
    loadAuthors(1, '', {});
  };

  const handleRefresh = () => {
    loadAuthors(currentPage, searchQuery, filters, false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadAuthors(page, searchQuery, filters);
  };

  // Funções do modal
  const openModal = (mode: 'view' | 'create' | 'edit', author?: AuthorDto) => {
    setModalMode(mode);
    setSelectedAuthor(author || null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAuthor(null);
  };

  const handleModalSave = async (data: any) => {
    try {
      setLoading(true);
      
      if (modalMode === 'create') {
        await authorService.createAuthor(data);
        showSuccess(`Autor "${data.name}" criado com sucesso!`);
      } else if (modalMode === 'edit' && selectedAuthor) {
        await authorService.updateAuthor(Number(selectedAuthor.id), data);
        showSuccess(`Autor "${data.name}" atualizado com sucesso!`);
      }
      
      closeModal();
      await loadAuthors(currentPage, searchQuery, filters, false);
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao salvar autor:', error);
      showError("Erro ao salvar autor.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (author: AuthorDto) => {
    if (!confirm(`Tem certeza que deseja excluir o autor "${author.name}"?`)) return;

    try {
      setLoading(true);
      await authorService.deleteAuthor(Number(author.id));
      showSuccess("Autor excluído com sucesso.");
      await loadAuthors(currentPage, searchQuery, filters, false);
    } catch (error: any) {
      console.error('❌ Erro ao excluir autor:', error);
      showError("Erro ao excluir autor.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (author: AuthorDto) => {
    try {
      setLoading(true);
      const updatedAuthor = await authorService.toggleAuthorStatus(Number(author.id));
      const newStatus = updatedAuthor.is_active ? 'ativado' : 'desativado';
      showSuccess(`Autor "${author.name}" ${newStatus} com sucesso.`);
      
      // Atualizar estado local para feedback visual rápido
      const updatedAuthors = authors.map(auth =>
        auth.id === author.id ? { ...auth, is_active: updatedAuthor.is_active } : auth
      );
      setAuthors(updatedAuthors);
      
      // Recalcular estatísticas
      const newStats = calculateStats(updatedAuthors);
      setStats(newStats);
    } catch (error: any) {
      console.error('❌ Erro ao alterar status do autor:', error);
      showError("Erro ao alterar status do autor.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Autores</h1>
              <p className="text-gray-600 mt-1">Gerencie os autores do sistema de conteúdo</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing || loading} 
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => openModal('create')} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo Autor
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Users}
              title="Total"
              value={stats.totalAuthors}
              subtitle="Autores"
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title="Ativos"
              value={stats.activeAuthors}
              subtitle="Funcionando"
              color="green"
            />
            <StatCard
              icon={User}
              title="Inativos"
              value={stats.inactiveAuthors}
              subtitle="Desativados"
              color="red"
            />
            <StatCard
              icon={BookOpen}
              title="Com Descrição"
              value={stats.authorsWithBio}
              subtitle="Descrições"
              color="purple"
            />
          </div>

          {/* Search & Filter */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar autor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={loading}>
                Buscar
              </Button>
              <Button 
                onClick={() => setShowFilterPanel(!showFilterPanel)} 
                variant="outline" 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </form>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                    <select
                      value={filters.is_active === undefined ? '' : String(filters.is_active)}
                      onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                    >
                      <option value="">Todos</option>
                      <option value="true">Ativo</option>
                      <option value="false">Inativo</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <Button variant="ghost" onClick={clearFilters} disabled={loading}>
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                  <Button onClick={applyFilters} disabled={loading}>
                    Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando autores...</span>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum autor encontrado</p>
              <p className="text-gray-400 text-sm">
                {searchQuery || Object.keys(filters).length > 0 
                  ? "Tente ajustar sua busca ou filtros." 
                  : "Clique em \"Novo Autor\" para adicionar o primeiro"
                }
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
                        Autor
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
                    {authors.map((author) => (
                      <tr key={author.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {author.name || 'Nome não informado'}
                              </div>
                              <div className="text-xs text-gray-500">ID: {author.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {author.description ? (
                              author.description.length > 100 
                                ? `${author.description.substring(0, 100)}...`
                                : author.description
                            ) : (
                              <span className="text-gray-400">Sem descrição</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant={author.is_active ? 'success' : 'danger'}>
                            {author.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center text-sm text-gray-500">
                          {author.created_at ? new Date(author.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('view', author)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal('edit', author)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAuthor(author)}
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

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {authors.map((author) => (
                  <div key={author.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {author.name || 'Nome não informado'}
                          </h3>
                          <div className="text-xs text-gray-500">ID: {author.id}</div>
                        </div>
                      </div>
                      <Badge variant={author.is_active ? 'success' : 'danger'}>
                        {author.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-2">
                      {author.description && (
                        <div className="text-sm text-gray-600">
                          {author.description.length > 150 
                            ? `${author.description.substring(0, 150)}...`
                            : author.description
                          }
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Criado em: {author.created_at ? new Date(author.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => openModal('view', author)}>
                        Ver
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openModal('edit', author)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteAuthor(author)}>
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} autores
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-700">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={closeModal}
        title={
          modalMode === 'view' ? `Visualizar Autor: ${selectedAuthor?.name}` :
          modalMode === 'edit' ? `Editar Autor: ${selectedAuthor?.name}` :
          'Novo Autor'
        }
        size="lg"
      >
        <AuthorForm
          author={selectedAuthor}
          mode={modalMode}
          onSubmit={handleModalSave}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
} 
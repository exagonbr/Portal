'use client';

import { useState, useEffect, useCallback } from 'react';
import { authorService } from '@/services/authorService';
import { AuthorDto } from '@/types/author';
import { useToast } from '@/components/ToastManager';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, CheckCircle, XCircle, User, Users, UserCheck, BookOpen, AlertTriangle } from 'lucide-react';
import { StatCard, ContentCard } from '@/components/ui/StandardCard';
import Modal from '@/components/ui/Modal';
import AuthorForm from '@/components/forms/AuthorForm';

// Interface para resposta paginada - usando a mesma do serviço
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Interface para estatísticas dos autores
interface AuthorStats {
  totalAuthors: number;
  activeAuthors: number;
  inactiveAuthors: number;
  authorsWithBio: number;
}

export default function AuthorsPageContent() {
  const { showSuccess, showError, showWarning } = useToast();
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorDto | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [stats, setStats] = useState<AuthorStats>({
    totalAuthors: 0,
    activeAuthors: 0,
    inactiveAuthors: 0,
    authorsWithBio: 0
  });

  const calculateStatsFromAuthors = (authorsList?: AuthorDto[], totalCount?: number) => {
    const currentAuthors = authorsList || authors;
    const totalAuthors = totalCount || totalItems || currentAuthors.length;
    
    // Contar autores ativos e inativos
    const activeAuthors = currentAuthors.filter(author => author.is_active).length;
    const inactiveAuthors = currentAuthors.filter(author => !author.is_active).length;
    
      // Contar autores com descrição
  const authorsWithBio = currentAuthors.filter(author => author.description && author.description.trim()).length;
    
    setStats({
      totalAuthors,
      activeAuthors,
      inactiveAuthors,
      authorsWithBio
    });
    
    console.log('📊 Stats de autores calculados:', {
      totalAuthors,
      activeAuthors,
      inactiveAuthors,
      authorsWithBio
    });
  };

  const fetchAuthors = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setLoadingError(null); // Limpar erros anteriores

    try {
      console.log('🔄 [AUTHORS] Carregando autores...', { page, search, limit: itemsPerPage });
      
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      const response = await authorService.getAuthors(params);
      
      console.log('✅ [AUTHORS] Resposta do serviço de autores:', {
        items: response.items?.length || 0,
        total: response.total,
        page: response.page,
        totalPages: response.totalPages,
        format: Array.isArray(response.items) ? 'PaginatedResponse' : 'unknown'
      });
      
      // Verificar se a resposta tem o formato esperado
      if (!response || !Array.isArray(response.items)) {
        console.error('❌ [AUTHORS] Formato de resposta inválido:', response);
        throw new Error('Formato de resposta inválido do servidor');
      }
      
      setAuthors(response.items);
      setTotalItems(response.total || 0);
      setCurrentPage(response.page || page);
      
      // Calcular estatísticas
      calculateStatsFromAuthors(response.items, response.total);
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de autores atualizada com sucesso!");
      }
      
      console.log('✅ [AUTHORS] Autores carregados com sucesso:', response.items.length);
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao carregar autores:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        setLoadingError("Sessão expirada. Por favor, faça login novamente.");
        showError("Sessão expirada", "Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      setLoadingError("Não foi possível carregar a lista de autores. Tente novamente.");
      showError("Erro ao carregar autores", `Não foi possível carregar a lista de autores: ${errorMessage}`);
      
      // Em caso de erro, limpar dados para evitar inconsistências
      setAuthors([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuthors(currentPage, searchQuery);
  }, [currentPage]);

  // Recalcular estatísticas quando os autores mudarem
  useEffect(() => {
    if (authors.length > 0) {
      calculateStatsFromAuthors();
    }
  }, [authors, totalItems]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAuthors(1, searchQuery);
  };

  const handleRefresh = () => {
    fetchAuthors(currentPage, searchQuery, false);
  };

  // Funções para o modal
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
      
      console.log('💾 [AUTHORS] Salvando autor...', { mode: modalMode, data });
      
      if (modalMode === 'create') {
        const newAuthor = await authorService.createAuthor(data);
        console.log('✅ [AUTHORS] Autor criado:', newAuthor);
        showSuccess("Sucesso", `Autor "${data.name}" criado com sucesso!`);
      } else if (modalMode === 'edit' && selectedAuthor) {
        const updatedAuthor = await authorService.updateAuthor(Number(selectedAuthor.id), data);
        console.log('✅ [AUTHORS] Autor atualizado:', updatedAuthor);
        showSuccess("Sucesso", `Autor "${data.name}" atualizado com sucesso!`);
      }
      
      closeModal();
      
      // Recarregar a lista para garantir sincronização completa
      await fetchAuthors(currentPage, searchQuery, false);
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao salvar autor:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao salvar autor", `Não foi possível salvar o autor: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (author: AuthorDto) => {
    const confirmMessage = `Tem certeza que deseja excluir o autor "${author.name}"?\n\nEsta ação não pode ser desfeita.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ [AUTHORS] Excluindo autor:', author.id);
      
      await authorService.deleteAuthor(Number(author.id));
      console.log('✅ [AUTHORS] Autor excluído com sucesso');
      
      showSuccess("Autor excluído", `Autor "${author.name}" excluído com sucesso.`);
      
      // Recarregar a lista
      await fetchAuthors(currentPage, searchQuery, false);
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao excluir autor:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao excluir autor", `Não foi possível excluir o autor: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (author: AuthorDto) => {
    try {
      setLoading(true);
      console.log('🔄 [AUTHORS] Alterando status do autor:', author.id, 'atual:', author.is_active);
      
      const updatedAuthor = await authorService.toggleAuthorStatus(Number(author.id));
      console.log('✅ [AUTHORS] Status alterado:', updatedAuthor);
      
      const newStatus = updatedAuthor.is_active ? 'ativado' : 'desativado';
      showSuccess("Status alterado", `Autor "${author.name}" ${newStatus} com sucesso.`);
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      const updatedAuthors = authors.map(auth =>
        auth.id === author.id
          ? { ...auth, is_active: updatedAuthor.is_active }
          : auth
      );
      
      setAuthors(updatedAuthors);
      
      // Recalcular estatísticas com os dados atualizados
      calculateStatsFromAuthors(updatedAuthors);
    } catch (error: any) {
      console.error('❌ [AUTHORS] Erro ao alterar status do autor:', error);
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada", "Por favor, faça login novamente.");
        return;
      }
      
      const errorMessage = error.message || "Erro desconhecido";
      showError("Erro ao alterar status", `Não foi possível alterar o status do autor: ${errorMessage}`);
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
              <h1 className="text-2xl font-bold text-gray-900">Autores</h1>
              <p className="text-gray-600 mt-1">Gerencie os autores do sistema</p>
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
              <Button onClick={() => openModal('create')} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Novo Autor
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
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
              icon={XCircle}
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

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar autor..."
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : loadingError ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <p className="text-red-500 text-lg mb-2">{loadingError}</p>
              <Button onClick={handleRefresh} variant="outline" className="mt-4">
                Tentar novamente
              </Button>
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum autor encontrado</p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? "Tente ajustar sua busca." : "Clique em \"Novo Autor\" para adicionar o primeiro"}
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
                        Biografia
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
                              <div className="text-sm font-medium text-gray-900">{author.name}</div>
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
                          <button
                            onClick={() => handleToggleStatus(author)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              author.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {author.is_active ? 'Ativo' : 'Inativo'}
                          </button>
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

              {/* Cards para Mobile/Tablet */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {authors.map((author) => (
                    <div key={author.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      {/* Header do Card */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{author.name}</h3>
                              <div className="text-xs text-gray-500">ID: {author.id}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleStatus(author)}
                            className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              author.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {author.is_active ? 'Ativo' : 'Inativo'}
                          </button>
                        </div>
                      </div>

                      {/* Body do Card */}
                      <div className="p-4">
                        {/* Descrição */}
                        {author.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              {author.description.length > 150 
                                ? `${author.description.substring(0, 150)}...`
                                : author.description
                              }
                            </p>
                          </div>
                        )}

                        {/* Data de criação */}
                        <div className="flex items-center mb-4">
                          <span className="text-xs text-gray-500">
                            Criado em: {author.created_at ? new Date(author.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                          </span>
                        </div>

                        {/* Ações */}
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('view', author)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal('edit', author)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAuthor(author)}
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
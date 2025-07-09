'use client';

import { useState, useEffect, useCallback } from 'react';
import { authorService } from '@/services/authorService';
import { AuthorDto } from '@/types/author';
import { useToast } from '@/components/ToastManager';
import { Button } from '@/components/ui/Button';
import { Plus, Search, Edit, Trash2, Eye, RefreshCw, CheckCircle, XCircle, User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import AuthorForm from '@/components/forms/AuthorForm';

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export default function AuthorsPage() {
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

  const fetchAuthors = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const params: any = {
        page,
        limit: itemsPerPage
      };
      
      if (search && search.trim()) {
        params.search = search.trim();
      }
      
      console.log('Iniciando carregamento de autores...');
      const response = await authorService.getAuthors(params) as PaginatedResponse<AuthorDto>;
      
      console.log('📊 API response:', response);
      
      if (!response.items) {
        console.error('Resposta sem items:', response);
        setAuthors([]);
        showError("Erro", "Formato de resposta inválido do servidor.");
        return;
      }
      
      setAuthors(response.items);
      setTotalItems(response.total || 0);
      setCurrentPage(page);
      
      if (!showLoadingIndicator) {
        showSuccess("Atualizado", "Lista de autores atualizada com sucesso!");
      }
      
      console.log('Autores carregados com sucesso:', response.items.length);
    } catch (error) {
      console.error('❌ Erro ao carregar autores:', error);
      setAuthors([]);
      showError("Erro ao carregar autores", "Não foi possível carregar a lista de autores.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuthors(currentPage, searchQuery);
  }, [currentPage]);

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
      
      if (modalMode === 'create') {
        await authorService.createAuthor(data);
        showSuccess("Sucesso", "Autor criado com sucesso!");
      } else if (modalMode === 'edit' && selectedAuthor) {
        await authorService.updateAuthor(Number(selectedAuthor.id), data);
        showSuccess("Sucesso", "Autor atualizado com sucesso!");
      }
      
      closeModal();
      
      // Recarregar a lista para garantir sincronização completa
      await fetchAuthors(currentPage, searchQuery, false);
    } catch (error) {
      console.error('❌ Erro ao salvar autor:', error);
      showError("Erro ao salvar autor", "Não foi possível salvar o autor.");
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
      await authorService.deleteAuthor(Number(author.id));
      showSuccess("Autor excluído", "O autor foi excluído com sucesso.");
      
      // Recarregar a lista
      await fetchAuthors(currentPage, searchQuery, false);
    } catch (error) {
      console.error('❌ Erro ao excluir autor:', error);
      showError("Erro ao excluir autor", "Não foi possível excluir o autor.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (author: AuthorDto) => {
    try {
      setLoading(true);
      const updatedAuthor = await authorService.toggleAuthorStatus(Number(author.id));
      
      const statusText = updatedAuthor.is_active ? 'ativado' : 'desativado';
      showSuccess("Status alterado", `Autor ${statusText} com sucesso!`);
      
      // Atualizar o estado local imediatamente para feedback visual rápido
      setAuthors(prevAuthors =>
        prevAuthors.map(auth =>
          auth.id === author.id
            ? { ...auth, is_active: updatedAuthor.is_active }
            : auth
        )
      );
    } catch (error) {
      console.error('❌ Erro ao alterar status do autor:', error);
      showError("Erro ao alterar status", "Não foi possível alterar o status do autor.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header Simplificado */}
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

          {/* Search Simplificado */}
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
          ) : authors.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum autor encontrado</p>
              <p className="text-gray-400 text-sm">Clique em "Novo Autor" para adicionar o primeiro</p>
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
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{author.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 line-clamp-2">{author.bio || 'N/A'}</div>
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
                          {new Date(author.created_at).toLocaleDateString('pt-BR')}
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
                        <div className="flex items-start justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 truncate">{author.name}</h3>
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
                        {/* Biografia */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 line-clamp-3">{author.bio || 'Sem biografia'}</p>
                        </div>

                        {/* Data de criação */}
                        <div className="flex items-center mb-4">
                          <span className="text-xs text-gray-500">
                            Criado em: {new Date(author.created_at).toLocaleDateString('pt-BR')}
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
          modalMode === 'create' 
            ? 'Novo Autor' 
            : modalMode === 'edit' 
              ? 'Editar Autor' 
              : 'Visualizar Autor'
        }
        size="md"
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
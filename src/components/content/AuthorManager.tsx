'use client';

import { useState, useEffect } from 'react';
import { authorService } from '@/services/authorService';
import { AuthorDto, CreateAuthorDto, UpdateAuthorDto } from '@/types/author';
import { PaginatedResponse } from '@/types/api';
import { toast } from 'react-hot-toast';
import Table from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/Switch';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function AuthorManager() {
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAuthor, setCurrentAuthor] = useState<CreateAuthorDto>({
    name: '',
    description: '',
    email: '',
    is_active: true,
  });
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAuthors();
  }, [page, searchTerm]);

  const loadAuthors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authorService.getAuthors({
        page,
        limit: 10,
        search: searchTerm,
      });
      
      setAuthors(response.items);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar autores');
      toast.error('Erro ao carregar a lista de autores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAuthor = async () => {
    try {
      if (!currentAuthor.name || !currentAuthor.description) {
        toast.error('Nome e descrição são campos obrigatórios');
        return;
      }

      setLoading(true);
      
      if (isEditing && currentId) {
        await authorService.updateAuthor(currentId, currentAuthor as UpdateAuthorDto);
        toast.success('Autor atualizado com sucesso');
      } else {
        await authorService.createAuthor(currentAuthor);
        toast.success('Autor criado com sucesso');
      }
      
      setShowModal(false);
      resetForm();
      loadAuthors();
    } catch (err) {
      toast.error(isEditing ? 'Erro ao atualizar autor' : 'Erro ao criar autor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este autor?')) {
      try {
        setLoading(true);
        await authorService.deleteAuthor(id);
        toast.success('Autor excluído com sucesso');
        loadAuthors();
      } catch (err) {
        toast.error('Erro ao excluir autor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      setLoading(true);
      await authorService.toggleAuthorStatus(id);
      toast.success('Status do autor alterado com sucesso');
      loadAuthors();
    } catch (err) {
      toast.error('Erro ao alterar status do autor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editAuthor = (author: AuthorDto) => {
    setIsEditing(true);
    setCurrentId(Number(author.id));
    setCurrentAuthor({
      name: author.name,
      description: author.description,
      email: author.email || '',
      is_active: author.is_active,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setCurrentAuthor({
      name: '',
      description: '',
      email: '',
      is_active: true,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gerenciamento de Autores</h2>
        <Button onClick={openCreateModal} className="flex items-center gap-2">
          <Plus size={16} />
          Novo Autor
        </Button>
      </div>

      <div className="flex items-center mb-4">
        <Input
          placeholder="Buscar autores..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading && !showModal ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando autores...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : authors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum autor encontrado
        </div>
      ) : (
        <>
          <Table
            columns={[
              { key: 'name', title: 'Nome' },
              { key: 'description', title: 'Descrição' },
              { key: 'email', title: 'Email' },
              { 
                key: 'is_active', 
                title: 'Status',
                render: (value, record) => (
                  <span className={record.is_active ? 'text-green-600' : 'text-red-600'}>
                    {record.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                )
              },
              {
                key: 'actions',
                title: 'Ações',
                align: 'right',
                render: (_, record) => (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => editAuthor(record)}>
                      <Pencil size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteAuthor(Number(record.id))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )
              }
            ]}
            data={authors}
            loading={loading}
            emptyText="Nenhum autor encontrado"
          />

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    onClick={() => setPage(p)}
                    className="w-10 h-10 p-0"
                  >
                    {p}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próximo
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Autor' : 'Novo Autor'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={currentAuthor.name}
                onChange={(e) => setCurrentAuthor({...currentAuthor, name: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={currentAuthor.description}
                onChange={(e) => setCurrentAuthor({...currentAuthor, description: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                type="email"
                value={currentAuthor.email}
                onChange={(e) => setCurrentAuthor({...currentAuthor, email: e.target.value})}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                checked={currentAuthor.is_active}
                label="Autor ativo"
                onChange={(checked) => setCurrentAuthor({...currentAuthor, is_active: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateAuthor} disabled={loading}>
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
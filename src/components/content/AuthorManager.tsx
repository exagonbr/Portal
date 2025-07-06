'use client';

import { useState, useEffect } from 'react';
import { authorService } from '@/services/authorService';
import { AuthorDto, CreateAuthorDto, UpdateAuthorDto } from '@/types/author';
import { PaginatedResponse } from '@/types/api';
import { toast } from 'react-hot-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{author.description}</TableCell>
                  <TableCell>{author.email || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={author.is_active}
                      onCheckedChange={() => handleToggleStatus(Number(author.id))}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => editAuthor(author)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteAuthor(Number(author.id))}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="py-2 px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Autor' : 'Criar Novo Autor'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={currentAuthor.name}
                  onChange={(e) => setCurrentAuthor({ ...currentAuthor, name: e.target.value })}
                  placeholder="Nome do autor"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={currentAuthor.email}
                  onChange={(e) => setCurrentAuthor({ ...currentAuthor, email: e.target.value })}
                  placeholder="Email do autor"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={currentAuthor.description}
                  onChange={(e) => setCurrentAuthor({ ...currentAuthor, description: e.target.value })}
                  placeholder="Descrição do autor"
                  rows={4}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={currentAuthor.is_active}
                  onCheckedChange={(checked) => 
                    setCurrentAuthor({ ...currentAuthor, is_active: checked === true })
                  }
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
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
'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthorManager from '@/components/content/AuthorManager';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';
import { authorService } from '@/services/authorService';
import { AuthorDto } from '@/types/author';
import { useToast } from '@/components/ToastManager';

// Interface para resposta paginada
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export default function AuthorsPage() {
  const [authors, setAuthors] = useState<AuthorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });
  const { showSuccess, showError } = useToast();

  const loadAuthors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authorService.getAuthors({
        page: pagination.currentPage,
        limit: pagination.pageSize
      }) as PaginatedResponse<AuthorDto>;
      
      setAuthors(response.items);
      setPagination({
        ...pagination,
        total: response.total
      });
    } catch (error) {
      console.error('Erro ao carregar autores:', error);
      showError('Não foi possível carregar os autores.');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.pageSize, showError]);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/admin">
            <Home className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/admin/content">
            Gestão de Conteúdo
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>Autores</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Autores</h1>
      </div>

      <AuthorManager 
        authors={authors}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination({...pagination, currentPage: page})}
        onAuthorCreated={loadAuthors}
        onAuthorUpdated={loadAuthors}
        onAuthorDeleted={loadAuthors}
        onAuthorStatusToggled={loadAuthors}
      />
    </div>
  );
} 
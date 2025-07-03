import { useState, useEffect, useCallback } from 'react';
import { api, ApiClient } from '@/utils/api-client';

interface UseApiRequestOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook customizado para fazer requisições à API com gerenciamento de estado
 */
export function useApiRequest<T = any>(
  endpoint: string,
  options: UseApiRequestOptions = {}
): UseApiRequestReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { immediate = true, onSuccess, onError } = options;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<T>(endpoint);
      
      if (response.success && response.data) {
        setData(response.data);
        onSuccess?.(response.data);
      } else {
        const errorMsg = response.error || response.message || 'Erro desconhecido';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar dados';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    reset,
  };
}

/**
 * Hook para fazer mutações (POST, PUT, DELETE) na API
 */
export function useApiMutation<TData = any, TResponse = any>(
  endpoint: string,
  method: 'post' | 'put' | 'patch' | 'delete' = 'post'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResponse | null>(null);

  const mutate = useCallback(async (
    payload?: TData,
    options?: {
      onSuccess?: (data: TResponse) => void;
      onError?: (error: string) => void;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      switch (method) {
        case 'post':
          response = await api.post<TResponse>(endpoint, payload);
          break;
        case 'put':
          response = await api.put<TResponse>(endpoint, payload);
          break;
        case 'patch':
          response = await api.patch<TResponse>(endpoint, payload);
          break;
        case 'delete':
          response = await api.delete<TResponse>(endpoint);
          break;
      }

      if (response.success) {
        setData(response.data || null);
        options?.onSuccess?.(response.data!);
      } else {
        const errorMsg = response.error || response.message || 'Erro na operação';
        setError(errorMsg);
        options?.onError?.(errorMsg);
      }

      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao processar requisição';
      setError(errorMsg);
      options?.onError?.(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    reset,
  };
}

/**
 * Hook para buscar dados com paginação
 */
export function useApiPagination<T = any>(
  baseEndpoint: string,
  pageSize: number = 10
) {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = `${baseEndpoint}?page=${pageNumber}&limit=${pageSize}`;
      const response = await api.get<{
        items: T[];
        total: number;
        page: number;
        totalPages: number;
      }>(endpoint);

      if (response.success && response.data) {
        setItems(response.data.items);
        setTotalItems(response.data.total);
        setTotalPages(response.data.totalPages);
        setPage(response.data.page);
      } else {
        setError(response.error || 'Erro ao buscar dados');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar página');
    } finally {
      setLoading(false);
    }
  }, [baseEndpoint, pageSize]);

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  return {
    items,
    page,
    totalPages,
    totalItems,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    refetch: () => fetchPage(page),
  };
}
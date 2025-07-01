import { useState, useEffect, useCallback } from 'react';
import { TVShowCollection, CollectionsApiResponse } from '@/types/collections';

interface UseCollectionsReturn {
  collections: TVShowCollection[];
  popularCollections: TVShowCollection[];
  topRatedCollections: TVShowCollection[];
  recentCollections: TVShowCollection[];
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  searchCollections: (searchTerm: string) => Promise<void>;
  clearError: () => void;
}

export const useCollections = (): UseCollectionsReturn => {
  const [collections, setCollections] = useState<TVShowCollection[]>([]);
  const [popularCollections, setPopularCollections] = useState<TVShowCollection[]>([]);
  const [topRatedCollections, setTopRatedCollections] = useState<TVShowCollection[]>([]);
  const [recentCollections, setRecentCollections] = useState<TVShowCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const handleApiError = (error: any, defaultMessage: string) => {
    console.log(defaultMessage, error);
    setError(error instanceof Error ? error.message : defaultMessage);
  };

  const fetchCollections = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as coleções
      const allResponse = await fetch('/api/collections', {
        headers: getAuthHeaders(),
      });

      if (!allResponse.ok) {
        throw new Error('Erro ao carregar coleções');
      }

      const allData: CollectionsApiResponse = await allResponse.json();
      setCollections(allData.data);

      // Buscar coleções populares
      const popularResponse = await fetch('/api/collections/popular?limit=6', {
        headers: getAuthHeaders(),
      });

      if (popularResponse.ok) {
        const popularData: CollectionsApiResponse = await popularResponse.json();
        setPopularCollections(popularData.data);
      }

      // Buscar coleções mais bem avaliadas
      const topRatedResponse = await fetch('/api/collections/top-rated?limit=6', {
        headers: getAuthHeaders(),
      });

      if (topRatedResponse.ok) {
        const topRatedData: CollectionsApiResponse = await topRatedResponse.json();
        setTopRatedCollections(topRatedData.data);
      }

      // Buscar coleções recentes
      const recentResponse = await fetch('/api/collections/recent?limit=6', {
        headers: getAuthHeaders(),
      });

      if (recentResponse.ok) {
        const recentData: CollectionsApiResponse = await recentResponse.json();
        setRecentCollections(recentData.data);
      }

    } catch (error) {
      handleApiError(error, 'Erro ao carregar coleções. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchCollections = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await fetchCollections();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/collections/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao pesquisar coleções');
      }

      const data: CollectionsApiResponse = await response.json();
      setCollections(data.data);
      
      // Limpar outras listas durante a pesquisa
      setPopularCollections([]);
      setTopRatedCollections([]);
      setRecentCollections([]);

    } catch (error) {
      handleApiError(error, 'Erro ao pesquisar coleções. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchCollections]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return {
    collections,
    popularCollections,
    topRatedCollections,
    recentCollections,
    isLoading,
    error,
    fetchCollections,
    searchCollections,
    clearError,
  };
}; 
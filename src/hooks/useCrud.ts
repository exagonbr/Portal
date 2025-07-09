import { useState, useCallback } from 'react';
import { CrudService } from '../services/crudService';
import { useToast } from '@chakra-ui/react';

interface UseCrudOptions<T> {
  service: CrudService<T>;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    fetch?: string;
  };
}

export function useCrud<T>({
  service,
  successMessages = {},
  errorMessages = {},
}: UseCrudOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchData = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await service.getAll(params);
      setData(response);
    } catch (err) {
      setError(errorMessages.fetch || 'Erro ao carregar dados');
      toast({
        title: 'Erro',
        description: errorMessages.fetch || 'Erro ao carregar dados',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [service, errorMessages.fetch, toast]);

  const createItem = useCallback(async (item: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await service.create(item);
      setData((prev) => [...prev, response]);
      toast({
        title: 'Sucesso',
        description: successMessages.create || 'Item criado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return response;
    } catch (err) {
      setError(errorMessages.create || 'Erro ao criar item');
      toast({
        title: 'Erro',
        description: errorMessages.create || 'Erro ao criar item',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, successMessages.create, errorMessages.create, toast]);

  const updateItem = useCallback(async (id: string | number, item: Partial<T>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await service.update(id, item);
      setData((prev) =>
        prev.map((prevItem: any) =>
          prevItem.id === id ? { ...prevItem, ...response } : prevItem
        )
      );
      toast({
        title: 'Sucesso',
        description: successMessages.update || 'Item atualizado com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      return response;
    } catch (err) {
      setError(errorMessages.update || 'Erro ao atualizar item');
      toast({
        title: 'Erro',
        description: errorMessages.update || 'Erro ao atualizar item',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, successMessages.update, errorMessages.update, toast]);

  const deleteItem = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      await service.delete(id);
      setData((prev) => prev.filter((item: any) => item.id !== id));
      toast({
        title: 'Sucesso',
        description: successMessages.delete || 'Item excluído com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(errorMessages.delete || 'Erro ao excluir item');
      toast({
        title: 'Erro',
        description: errorMessages.delete || 'Erro ao excluir item',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [service, successMessages.delete, errorMessages.delete, toast]);

  const searchItems = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await service.search(query);
      setData(response);
    } catch (err) {
      setError('Erro ao pesquisar itens');
      toast({
        title: 'Erro',
        description: 'Erro ao pesquisar itens',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [service, toast]);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    searchItems,
  };
} 
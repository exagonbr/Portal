'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { apiClient, ApiClientError } from '@/services/apiClient';

interface CollectionDetail {
  id: string;
  name: string;
  description?: string;
  itemCount?: number;
  createdAt?: string; // Or Date
  updatedAt?: string; // Or Date
  // Add more fields as needed, e.g., list of items in the collection
  items?: Array<{ id: string; name: string; type: string }>;
}

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id as string;

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (collectionId) {
      const fetchCollectionDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          // TODO: Adjust API endpoint as necessary
          const response = await apiClient.get<CollectionDetail>(`/api/admin/collections/${collectionId}`);
          
          if (response.success && response.data) {
            setCollection(response.data);
          } else {
            setError(response.message || `Falha ao buscar detalhes da coleção ${collectionId}.`);
          }
        } catch (err) {
          if (err instanceof ApiClientError) {
            setError(err.message);
          } else {
            setError('Ocorreu um erro desconhecido ao buscar detalhes da coleção.');
          }
          console.error(`Erro ao buscar detalhes da coleção ${collectionId}:`, err);
        } finally {
          setLoading(false);
        }
      };
      fetchCollectionDetails();
    } else {
      // Handle case where collectionId is not available, though the initial check should catch this.
      setLoading(false);
      setError("ID da coleção não encontrado.");
    }
  }, [collectionId]);

  if (!collectionId && !loading) { // Handles case where ID might become invalid after initial check
     return (
      <div className="space-y-6 p-6 text-center py-12">
        <p className="text-xl text-red-500">ID da coleção inválido ou não fornecido.</p>
         <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Voltar
        </button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="space-y-6 p-6 text-center py-12">
        <p className="text-gray-500">Carregando detalhes da coleção...</p>
        {/* You can add a spinner here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar Coleção</h1>
        <p className="text-red-500 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="space-y-6 p-6 text-center py-12">
        <p className="text-gray-500">Coleção não encontrada.</p>
         <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{collection.name || `Coleção ID: ${collection.id}`}</h1>
          {collection.name && <p className="text-gray-600">ID: {collection.id}</p>}
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Informações da Coleção</h2>
        {collection.description && (
          <p className="text-gray-700 mb-4">{collection.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">ID da Coleção: </span>
            <span className="text-gray-800">{collection.id}</span>
          </div>
          {collection.itemCount !== undefined && (
            <div>
              <span className="font-medium text-gray-600">Número de Itens: </span>
              <span className="text-gray-800">{collection.itemCount}</span>
            </div>
          )}
          {collection.createdAt && (
            <div>
              <span className="font-medium text-gray-600">Criada em: </span>
              <span className="text-gray-800">{new Date(collection.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
           {collection.updatedAt && (
            <div>
              <span className="font-medium text-gray-600">Atualizada em: </span>
              <span className="text-gray-800">{new Date(collection.updatedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>

        {collection.items && collection.items.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-3">Itens na Coleção:</h3>
            <ul className="list-disc list-inside space-y-1">
              {collection.items.map(item => (
                <li key={item.id} className="text-gray-700">
                  {item.name} <span className="text-xs text-gray-500">({item.type})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
         {!collection.items || collection.items.length === 0 && (
            <p className="text-gray-500 mt-4">
              Nenhum item nesta coleção.
            </p>
        )}
      </div>
    </div>
  );
}
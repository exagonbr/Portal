'use client';

import { useParams, useRouter } from 'next/navigation';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params?.id as string;

  if (!params || !collectionId) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Detalhes da Coleção</h1>
          <p className="text-gray-600">ID: {collectionId}</p>
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
        <p className="text-gray-600">
          Esta página mostrará os detalhes da coleção com ID: {collectionId}
        </p>
        <p className="text-gray-500 mt-4">
          Implementação em desenvolvimento...
        </p>
      </div>
    </div>
  );
}
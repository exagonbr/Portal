'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ModuleManager from '@/components/content/ModuleManager';

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gerenciar Coleção</h1>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Voltar
        </button>
      </div>

      <div className="mt-6">
        <ModuleManager collectionId={collectionId} />
      </div>
    </div>
  );
}
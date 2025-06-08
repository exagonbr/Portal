'use client';

import { useState, useEffect } from 'react';
import { Collection } from '@/types/collection';
import { s3Service } from '@/services/s3Service';
import { mockContentCollections } from '@/constants/mockData';

export default function CollectionManager() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({
    name: '',
    synopsis: '',
    subject: '',
    supportMaterial: '',
    coverImage: '',
    totalDuration: 0,
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be replaced with an actual API call
      // For now, we'll use mock data from mockData.ts
      setCollections(mockContentCollections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      if (!newCollection.name.trim()) {
        setError('Nome da coleção é obrigatório');
        return;
      }

      if (!newCollection.subject.trim()) {
        setError('Disciplina é obrigatória');
        return;
      }

      // This would be replaced with an actual API call
      const newCollectionData: Collection = {
        id: `collection_${Date.now()}`,
        name: newCollection.name,
        synopsis: newCollection.synopsis,
        coverImage: newCollection.coverImage || '/placeholder-thumbnail.png',
        supportMaterial: newCollection.supportMaterial,
        totalDuration: newCollection.totalDuration,
        subject: newCollection.subject,
        modules: [],
        tags: newCollection.tags,
        createdBy: 'current-user-id', // Replace with actual user ID
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCollections(prev => [...prev, newCollectionData]);
      setShowCreateModal(false);
      setNewCollection({
        name: '',
        synopsis: '',
        subject: '',
        supportMaterial: '',
        coverImage: '',
        totalDuration: 0,
        tags: []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create collection');
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção?')) return;

    try {
      // This would be replaced with an actual API call
      setCollections(prev => prev.filter(c => c.id !== collectionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete collection');
    }
  };

  const handleTagAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!newCollection.tags?.includes(tagInput.trim())) {
        setNewCollection(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewCollection(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Coleções</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Nova Coleção
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando coleções...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhuma coleção encontrada
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(collection => (
            <div
              key={collection.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={collection.coverImage || '/placeholder-thumbnail.png'}
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg truncate" title={collection.name}>
                  {collection.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {collection.synopsis}
                </p>
                
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Disciplina:</span> {collection.subject}
                </p>
                
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Duração total:</span> {collection.totalDuration} 
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {collection.tags?.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  )) || []}
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>{collection.modules?.length || 0} módulos</span>
                  <span>{new Date(collection.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => window.location.href = `/admin/content/library/collections/${collection.id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Gerenciar
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Collection Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Nova Coleção</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={e => setNewCollection(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Nome da coleção"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sinopse
                </label>
                <textarea
                  value={newCollection.synopsis}
                  onChange={e => setNewCollection(prev => ({ ...prev, synopsis: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Sinopse da coleção"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disciplina
                </label>
                <input
                  type="text"
                  value={newCollection.subject}
                  onChange={e => setNewCollection(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Disciplina da coleção"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem de Capa (URL)
                </label>
                <input
                  type="text"
                  value={newCollection.coverImage}
                  onChange={e => setNewCollection(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="URL da imagem de capa"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Em produção, será substituído por um upload para o S3
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material de Apoio (URL do PDF)
                </label>
                <input
                  type="text"
                  value={newCollection.supportMaterial}
                  onChange={e => setNewCollection(prev => ({ ...prev, supportMaterial: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="URL do material de apoio (PDF)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Em produção, será substituído por um upload para o S3
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração Total (minutos)
                </label>
                <input
                  type="string"
                  value={newCollection.totalDuration || '0'}
                  onChange={e => setNewCollection(prev => ({
                    ...prev,
                    totalDuration: e.target.value ? 0 : 0 
                  }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Duração total em minutos"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newCollection.tags?.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  )) || []}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite tags e pressione Enter"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCollection}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
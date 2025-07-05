'use client';

import { useState, useEffect } from 'react';
import { ContentType, ContentMetadata, ContentSearchParams } from '@/types/content';
import { s3Service } from '@/services/s3Service';

export default function ContentLibrary() {
  const [contents, setContents] = useState<ContentMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<ContentSearchParams>({
    query: '',
    page: 1,
    limit: 12
  });
  const [selectedType, setSelectedType] = useState<ContentType | 'ALL'>('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  useEffect(() => {
    loadContents();
  }, [searchParams, selectedType, selectedTags]);

  const loadContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await s3Service.listContents();
      
      let filtered = results;
      if (selectedType !== 'ALL') {
        filtered = filtered.filter(content => content.type === selectedType);
      }
      if (selectedTags.length > 0) {
        filtered = filtered.filter(content => 
          selectedTags.every(tag => content.tags.includes(tag))
        );
      }

      setContents(filtered);
      
      const tags = new Set<string>();
      results.forEach(content => {
        content.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (content: ContentMetadata) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await s3Service.deleteContent(content.s3Key || '');
      setContents(prev => prev.filter(c => c.id !== content.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete content');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              value={searchParams.query}
              onChange={e => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as ContentType | 'ALL')}
            className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="ALL">Todos os tipos</option>
            {Object.values(ContentType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTags.includes(tag)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando conteúdo...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : contents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum conteúdo encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contents.map(content => (
            <div
              key={content.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={content.thumbnail || '/placeholder-thumbnail.png'}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  {content.type}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-lg truncate" title={content.title}>
                  {content.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {content.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {content.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>{formatFileSize(content.size)}</span>
                  <span>{formatDate(content.uploadedAt)}</span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => window.open(content.url, '_blank')}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    Visualizar
                  </button>
                  <button
                    onClick={() => handleDelete(content)}
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
    </div>
  );
}

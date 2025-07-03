'use client';

import { useState, useEffect } from 'react';
import { ContentType, ContentMetadata, ContentSearchParams } from '@/types/content';
import { s3Service } from '@/services/s3Service';
import ContentUploadModal from './ContentUploadModal';
import CarouselManager from './CarouselManager';

export interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

export interface AreaContentManagerProps {
  area: 'student' | 'books' | 'videos';
  allowedTypes: ContentType[];
  title: string;
}

export default function AreaContentManager({ area, allowedTypes, title }: AreaContentManagerProps) {
  const [contents, setContents] = useState<ContentMetadata[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);

  useEffect(() => {
    loadContents();
    loadCarouselImages();
  }, [area, searchParams, selectedType, selectedTags]);

  const loadContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await s3Service.listContents(`${area}/content`);
      
      let filtered = results.filter(content => 
        allowedTypes.includes(content.type)
      );

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
      setError(err instanceof Error ? err.message : 'Falha ao carregar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const loadCarouselImages = async () => {
    try {
      const results = await s3Service.listContents(`${area}/carousel`);
      const images = results.map(content => ({
        src: content.url,
        alt: content.description,
        title: content.title
      }));
      setCarouselImages(images);
    } catch (err) {
      console.error('Falha ao carregar imagens do carrossel:', err);
    }
  };

  const handleDelete = async (content: ContentMetadata) => {
'Tem certeza que deseja excluir este conteúdo?'

    try {
      await s3Service.deleteContent(content.s3Key || '');
      setContents(prev => prev.filter(c => c.id !== content.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao excluir conteúdo');
    }
  };

  const handleUpload = async (file: File, metadata: Partial<ContentMetadata>) => {
    try {
      const response = await s3Service.initiateUpload(file, {
        ...metadata,
        tags: [...(metadata.tags || []), area]
      });
      
      // Upload the file using the presigned URL
      await fetch(response.uploadUrl, {
        method: 'PUT',
        body: file
      });

      loadContents();
      setIsUploadModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar conteúdo');
    }
  };

  const handleCarouselImageUpload = async (file: File, metadata: { title: string; description: string }) => {
    try {
      const response = await s3Service.initiateUpload(file, {
        title: metadata.title,
        description: metadata.description,
        tags: [area, 'carousel'],
        type: ContentType.MP4
      });
      
      await fetch(response.uploadUrl, {
        method: 'PUT',
        body: file
      });

      loadCarouselImages();
      setIsCarouselModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao enviar imagem do carrossel');
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title} Gerenciamento de Conteúdo</h1>
        <div className="space-x-4">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Enviar Conteúdo
          </button>
          <button
            onClick={() => setIsCarouselModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Gerenciar Carrossel
          </button>
        </div>
      </div>

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
            {allowedTypes.map(type => (
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

      <ContentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUpload}
        allowedTypes={allowedTypes}
      />

      <CarouselManager
        isOpen={isCarouselModalOpen}
        onClose={() => setIsCarouselModalOpen(false)}
        onUpload={handleCarouselImageUpload}
        images={carouselImages}
        onDelete={async (image) => {
          try {
            // Extract s3Key from image URL
            const s3Key = image.src.split('/').pop();
            if (s3Key) {
              await s3Service.deleteContent(`${area}/carousel/${s3Key}`);
              loadCarouselImages();
            }
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao excluir imagem do carrossel');
          }
        }}
      />
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

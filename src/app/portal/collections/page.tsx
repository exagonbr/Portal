'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { PlayIcon, StarIcon, CalendarIcon, UserIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface TVShowCollection {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  first_air_date: Date;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  producer?: string;
  total_load?: string;
  manual_support_path?: string;
  contract_term_end: Date;
  created_at: Date;
  updated_at: Date;
}

interface ApiResponse {
  success: boolean;
  data: TVShowCollection[];
  message: string;
}

export default function CollectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<TVShowCollection[]>([]);
  const [popularCollections, setPopularCollections] = useState<TVShowCollection[]>([]);
  const [topRatedCollections, setTopRatedCollections] = useState<TVShowCollection[]>([]);
  const [recentCollections, setRecentCollections] = useState<TVShowCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<TVShowCollection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchCollections();
      }
    }
  }, [user, loading, router]);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar todas as coleções
      const allResponse = await fetch('/api/collections', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!allResponse.ok) {
        throw new Error('Erro ao carregar coleções');
      }

      const allData: ApiResponse = await allResponse.json();
      setCollections(allData.data);

      // Buscar coleções populares
      const popularResponse = await fetch('/api/collections/popular?limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (popularResponse.ok) {
        const popularData: ApiResponse = await popularResponse.json();
        setPopularCollections(popularData.data);
      }

      // Buscar coleções mais bem avaliadas
      const topRatedResponse = await fetch('/api/collections/top-rated?limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (topRatedResponse.ok) {
        const topRatedData: ApiResponse = await topRatedResponse.json();
        setTopRatedCollections(topRatedData.data);
      }

      // Buscar coleções recentes
      const recentResponse = await fetch('/api/collections/recent?limit=6', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (recentResponse.ok) {
        const recentData: ApiResponse = await recentResponse.json();
        setRecentCollections(recentData.data);
      }

    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
      setError('Erro ao carregar coleções. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCollections();
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/collections/search?q=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao pesquisar coleções');
      }

      const data: ApiResponse = await response.json();
      setCollections(data.data);
    } catch (error) {
      console.error('Erro ao pesquisar:', error);
      setError('Erro ao pesquisar coleções. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  };

  const getImageUrl = (path?: string) => {
    if (!path) return '/placeholder-collection.jpg';
    if (path.startsWith('http')) return path;
    return `/collections/${path}`;
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating / 2); // Convert from 10-point to 5-point scale
    const hasHalfStar = (rating / 2) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIcon key={i} className="w-4 h-4 text-yellow-400 opacity-50" />);
      } else {
        stars.push(<StarOutlineIcon key={i} className="w-4 h-4 text-gray-300" />);
      }
    }

    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating?.toFixed(1)})</span>
      </div>
    );
  };

  const CollectionCard = ({ collection }: { collection: TVShowCollection }) => (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedCollection(collection)}
    >
      <div className="relative h-48 bg-gray-200">
        <img
          src={getImageUrl(collection.poster_path || collection.backdrop_path)}
          alt={collection.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-collection.jpg';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <PlayIcon className="w-12 h-12 text-white" />
        </div>
        {collection.popularity && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            ★ {collection.popularity.toFixed(1)}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{collection.name}</h3>
        
        {collection.overview && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{collection.overview}</p>
        )}
        
        <div className="space-y-2">
          {collection.vote_average && renderStars(collection.vote_average)}
          
          {collection.producer && (
            <div className="flex items-center text-sm text-gray-500">
              <UserIcon className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{collection.producer}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{formatDate(collection.first_air_date)}</span>
          </div>
          
          {collection.total_load && (
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="w-4 h-4 mr-1" />
              <span>Carga: {collection.total_load}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const CollectionSection = ({ title, collections, emptyMessage }: { 
    title: string; 
    collections: TVShowCollection[]; 
    emptyMessage: string;
  }) => (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Coleções de Vídeos</h1>
              <p className="mt-2 text-gray-600">
                Explore nossa biblioteca de conteúdos educacionais organizados em coleções temáticas
              </p>
            </div>
            
            {/* Search */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar coleções..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {searchTerm ? (
          <CollectionSection
            title={`Resultados para "${searchTerm}"`}
            collections={collections}
            emptyMessage="Nenhuma coleção encontrada para esta pesquisa."
          />
        ) : (
          <>
            <CollectionSection
              title="Coleções Populares"
              collections={popularCollections}
              emptyMessage="Nenhuma coleção popular encontrada."
            />

            <CollectionSection
              title="Mais Bem Avaliadas"
              collections={topRatedCollections}
              emptyMessage="Nenhuma coleção avaliada encontrada."
            />

            <CollectionSection
              title="Adicionadas Recentemente"
              collections={recentCollections}
              emptyMessage="Nenhuma coleção recente encontrada."
            />

            <CollectionSection
              title="Todas as Coleções"
              collections={collections}
              emptyMessage="Nenhuma coleção encontrada."
            />
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={getImageUrl(selectedCollection.backdrop_path || selectedCollection.poster_path)}
                alt={selectedCollection.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-collection.jpg';
                }}
              />
              <button
                onClick={() => setSelectedCollection(null)}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{selectedCollection.name}</h2>
              
              {selectedCollection.overview && (
                <p className="text-gray-700 mb-4">{selectedCollection.overview}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {selectedCollection.vote_average && (
                  <div>
                    <span className="font-semibold">Avaliação:</span>
                    <div className="mt-1">{renderStars(selectedCollection.vote_average)}</div>
                  </div>
                )}
                
                {selectedCollection.producer && (
                  <div>
                    <span className="font-semibold">Produtor:</span>
                    <p className="text-gray-700">{selectedCollection.producer}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-semibold">Data de Lançamento:</span>
                  <p className="text-gray-700">{formatDate(selectedCollection.first_air_date)}</p>
                </div>
                
                {selectedCollection.total_load && (
                  <div>
                    <span className="font-semibold">Carga Horária:</span>
                    <p className="text-gray-700">{selectedCollection.total_load}</p>
                  </div>
                )}
                
                {selectedCollection.popularity && (
                  <div>
                    <span className="font-semibold">Popularidade:</span>
                    <p className="text-gray-700">{selectedCollection.popularity.toFixed(1)}</p>
                  </div>
                )}
                
                {selectedCollection.vote_count && (
                  <div>
                    <span className="font-semibold">Número de Avaliações:</span>
                    <p className="text-gray-700">{selectedCollection.vote_count}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedCollection(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    // Aqui você pode implementar a navegação para o player de vídeo
                    console.log('Assistir coleção:', selectedCollection.id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <PlayIcon className="w-4 h-4" />
                  Assistir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
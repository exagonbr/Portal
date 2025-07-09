'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, Star, Eye } from 'lucide-react';
import { formatDate } from '@/utils/date';

interface TVShowListItem {
  id: number;
  name: string;
  producer?: string;
  total_load?: string;
  video_count?: number;
  created_at?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  first_air_date?: string;
  contract_term_end?: string;
  poster_image_url?: string;
  backdrop_image_url?: string;
}

interface TVShowListProps {
  shows: TVShowListItem[];
  onShowSelect: (show: TVShowListItem) => void;
  onSearch: (term: string) => void;
  isLoading: boolean;
  expandedDescriptions: Set<number>;
  onToggleDescription: (id: number) => void;
}

export function TVShowList({
  shows,
  onShowSelect,
  onSearch,
  isLoading,
  expandedDescriptions,
  onToggleDescription
}: TVShowListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    producer: '',
    minDuration: '',
    maxDuration: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name'
  });

  return (
    <div className="space-y-4">
      {/* Barra de pesquisa e filtros */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar coleções..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => onSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center gap-2"
        >
          <Filter size={20} />
          Filtros
        </button>
      </div>

      {/* Painel de filtros */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produtor
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                value={filters.producer}
                onChange={(e) => setFilters({ ...filters, producer: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data inicial
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data final
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 rounded-md border border-gray-300"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de shows */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((show) => (
            <div
              key={show.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onShowSelect(show)}
            >
              <div className="relative h-48">
                <img
                  src={show.poster_image_url || show.poster_path || '/images/default-poster.jpg'}
                  alt={show.name}
                  className="w-full h-full object-cover"
                />
                {show.vote_average && (
                  <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} className="text-yellow-400" />
                    <span className="text-sm">{show.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{show.name}</h3>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatDate(show.created_at || '')}</span>
                  </div>
                  {show.video_count && (
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      <span>{show.video_count} vídeos</span>
                    </div>
                  )}
                </div>
                {show.overview && (
                  <div className="mt-3">
                    <p className={`text-sm text-gray-700 ${expandedDescriptions.has(show.id) ? '' : 'line-clamp-2'}`}>
                      {show.overview}
                    </p>
                    {show.overview.length > 100 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleDescription(show.id);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                      >
                        {expandedDescriptions.has(show.id) ? 'Ver menos' : 'Ver mais'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
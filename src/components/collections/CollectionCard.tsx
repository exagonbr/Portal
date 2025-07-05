import React from 'react';
import { PlayIcon, StarIcon, CalendarIcon, UserIcon, EyeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { TVShowCollection } from '@/types/collections';

interface CollectionCardProps {
  collection: TVShowCollection;
  onClick: (collection: TVShowCollection) => void;
  className?: string;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({ 
  collection, 
  onClick, 
  className = '' 
}) => {
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
      <div className="flex items-center gap-1 rating-stars">
        {stars}
        <span className="text-sm text-gray-600 ml-1">({rating?.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div 
      className={`collection-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${className}`}
      onClick={() => onClick(collection)}
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
              <UserIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{collection.producer}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>{collection.first_air_date ? formatDate(collection.first_air_date) : 'Data não disponível'}</span>
          </div>
          
          {collection.total_load && (
            <div className="flex items-center text-sm text-gray-500">
              <EyeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span>Carga: {collection.total_load}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
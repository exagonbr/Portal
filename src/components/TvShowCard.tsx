import React from 'react';
import { Play, Star, Eye, Heart, Clock } from 'lucide-react';

interface TvShow {
  id: string;
  title: string;
  synopsis?: string;
  description?: string;
  cover_image_url?: string;
  banner_image_url?: string;
  total_episodes: number;
  total_seasons: number;
  total_duration: number;
  genre?: string;
  target_audience?: string;
  content_rating?: string;
  subjects: string[];
  tags: string[];
  language: string;
  difficulty_level: 'basic' | 'intermediate' | 'advanced';
  is_public: boolean;
  is_premium: boolean;
  is_featured: boolean;
  status: 'draft' | 'published' | 'archived';
  views_count: number;
  likes_count: number;
  favorites_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

interface TvShowCardProps {
  tvShow: TvShow;
  onPlay?: (tvShow: TvShow) => void;
  onLike?: (tvShow: TvShow) => void;
  onFavorite?: (tvShow: TvShow) => void;
  className?: string;
}

export const TvShowCard: React.FC<TvShowCardProps> = ({
  tvShow,
  onPlay,
  onLike,
  onFavorite,
  className = ''
}) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDifficultyColor = (level: string): string => {
    switch (level) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (level: string): string => {
    switch (level) {
      case 'basic': return 'Básico';
      case 'intermediate': return 'Intermediário';
      case 'advanced': return 'Avançado';
      default: return level;
    }
  };

  return (
    <div className={`group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      <div className="relative">
        {tvShow.cover_image_url ? (
          <img
            src={tvShow.cover_image_url}
            alt={tvShow.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Play className="w-16 h-16 text-white opacity-70" />
          </div>
        )}
        
        {/* Badges de status */}
        <div className="absolute top-2 left-2 flex gap-1">
          {tvShow.is_featured && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">
              ⭐ Destaque
            </span>
          )}
          {tvShow.is_premium && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-500 text-white">
              👑 Premium
            </span>
          )}
        </div>

        {/* Botão de play */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlay?.(tvShow)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-black hover:bg-gray-100 px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Assistir
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-2 flex-1">
            {tvShow.title}
          </h3>
          <div className="flex items-center gap-1 text-sm text-yellow-600 ml-2">
            <Star className="w-4 h-4 fill-current" />
            <span>{tvShow.rating_average.toFixed(1)}</span>
          </div>
        </div>
        
        {tvShow.synopsis && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {tvShow.synopsis}
          </p>
        )}

        {/* Informações da série */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Play className="w-4 h-4" />
            <span>{tvShow.total_episodes} episódios</span>
          </div>
          {tvShow.total_duration > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(tvShow.total_duration)}</span>
            </div>
          )}
        </div>

        {/* Tags e dificuldade */}
        <div className="flex flex-wrap gap-1 mb-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tvShow.difficulty_level)}`}>
            {getDifficultyLabel(tvShow.difficulty_level)}
          </span>
          {tvShow.genre && (
            <span className="px-2 py-1 text-xs font-medium rounded-full border border-gray-300 text-gray-700">
              {tvShow.genre}
            </span>
          )}
          {tvShow.subjects.slice(0, 2).map((subject, index) => (
            <span key={index} className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
              {subject}
            </span>
          ))}
          {tvShow.subjects.length > 2 && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
              +{tvShow.subjects.length - 2}
            </span>
          )}
        </div>

        {/* Estatísticas */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{tvShow.views_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              <span>{tvShow.likes_count.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex gap-1">
            <button
              onClick={() => onLike?.(tvShow)}
              className="p-1 h-8 w-8 rounded hover:bg-gray-100 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </button>
            <button
              onClick={() => onFavorite?.(tvShow)}
              className="p-1 h-8 w-8 rounded hover:bg-gray-100 transition-colors"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TvShowCard; 
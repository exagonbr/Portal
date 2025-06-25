'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, FileVideo, HelpCircle, Trash2, Play, Clock } from 'lucide-react';

interface TvShow {
  id: number;
  name: string;
  overview: string;
  producer: string;
  poster_path: string;
  backdrop_path: string;
  total_load: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  video_count: number;
  created_at: string;
}

interface Video {
  id: number;
  title: string;
  description: string;
  duration: string;
  poster_url: string;
  module_number: number;
  episode_number: number;
  order_in_module: number;
  tv_show_id: number;
}

interface ModuleStructure {
  [key: string]: Video[];
}

export default function TvShowManagePage() {
  const [tvShows, setTvShows] = useState<TvShow[]>([]);
  const [selectedTvShow, setSelectedTvShow] = useState<TvShow | null>(null);
  const [modules, setModules] = useState<ModuleStructure>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Carregar TV Shows
  const fetchTvShows = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(search && { search })
      });

      const response = await fetch(`/api/tv-shows?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTvShows(data.data.tvShows || []);
        setTotalPages(data.data.totalPages || 1);
        setCurrentPage(data.data.page || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar TV Shows:', error);
      setTvShows([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estrutura de módulos
  const fetchModules = async (tvShowId: number) => {
    try {
      const response = await fetch(`/api/tv-shows/${tvShowId}/modules`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setModules(data.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error);
      setModules({});
    }
  };

  useEffect(() => {
    fetchTvShows();
  }, []);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        fetchTvShows(1, searchTerm);
      } else {
        fetchTvShows(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleSelectTvShow = async (tvShow: TvShow) => {
    setSelectedTvShow(tvShow);
    await fetchModules(tvShow.id);
  };

  const handleBackToList = () => {
    setSelectedTvShow(null);
    setModules({});
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '00:00:00';
    return duration;
  };

  const getModuleColor = (moduleNumber: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600'
    ];
    return colors[moduleNumber % colors.length];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Vista detalhada da coleção selecionada
  if (selectedTvShow) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={handleBackToList}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              ← Voltar para lista
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{selectedTvShow.name}</h1>
            <p className="text-gray-600 mt-2">{selectedTvShow.overview}</p>
          </div>
          <button
            onClick={() => setShowVideoModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adicionar Vídeo
          </button>
        </div>

        {/* Módulos */}
        <div className="space-y-8">
          {Object.entries(modules).map(([moduleKey, videos]) => (
            <div key={moduleKey} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{moduleKey}</h2>
                <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">
                  Remover Módulo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {videos.map((video) => (
                  <div key={video.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                    {/* Card de vídeo baseado na imagem */}
                    <div className={`bg-gradient-to-br ${getModuleColor(video.module_number)} p-4 text-white relative`}>
                      <div className="absolute top-2 left-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                        PRO ⬇ FORP
                      </div>
                      
                      <div className="text-center mt-8">
                        <h3 className="text-lg font-bold mb-2">A DINÂMICA DO</h3>
                        <h4 className="text-xl font-bold">WORLD CAFÉ</h4>
                      </div>

                      <div className="absolute bottom-2 left-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                        SABER +ON
                      </div>
                    </div>

                    {/* Informações do vídeo */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {moduleKey}/{video.episode_code}
                        </h3>
                        <p className="text-gray-700 font-medium text-sm leading-tight">
                          {video.title}
                        </p>
                      </div>

                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        Duração: {formatDuration(video.duration)}
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-2 pt-2">
                        <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 flex items-center gap-1">
                          <Edit className="w-3 h-3" />
                          Editar
                        </button>
                        <button className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 flex items-center gap-1">
                          <FileVideo className="w-3 h-3" />
                          Gerenciar Arquivos
                        </button>
                        <button className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600 flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          Questionário
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(modules).length === 0 && (
          <div className="text-center py-12">
            <FileVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
            <p className="text-gray-600 mb-4">Comece adicionando vídeos a esta coleção</p>
            <button
              onClick={() => setShowVideoModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Adicionar Primeiro Vídeo
            </button>
          </div>
        )}
      </div>
    );
  }

  // Vista de lista de coleções
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coleções de TV</h1>
          <p className="text-gray-600 mt-2">Gerencie suas coleções de vídeos educacionais</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Coleção
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar coleções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Grid de coleções */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tvShows.map((tvShow) => (
          <div key={tvShow.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {tvShow.name}
                </h3>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {tvShow.overview}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Produtor: {tvShow.producer || 'N/A'}</span>
                <span>{tvShow.video_count || 0} vídeos</span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleSelectTvShow(tvShow)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Ver Vídeos
                </button>
                <div className="flex gap-2">
                  <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-1">
                    <FileVideo className="w-4 h-4" />
                    Arquivos
                  </button>
                  <button className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-1">
                    <HelpCircle className="w-4 h-4" />
                    Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <button
              onClick={() => fetchTvShows(currentPage - 1, searchTerm)}
              disabled={currentPage <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => fetchTvShows(currentPage + 1, searchTerm)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      {tvShows.length === 0 && !loading && (
        <div className="text-center py-12">
          <FileVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma coleção encontrada</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Tente alterar os termos de busca' : 'Comece criando sua primeira coleção'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Criar Primeira Coleção
          </button>
        </div>
      )}
    </div>
  );
} 
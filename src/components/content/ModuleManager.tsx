'use client';

import { useState, useEffect } from 'react';
import { Collection, Module, Video } from '@/types/collection';
import { s3Service } from '@/services/s3Service';

interface ModuleManagerProps {
  collectionId: string;
}

export default function ModuleManager({ collectionId }: ModuleManagerProps) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    coverImage: '',
    videoIds: [] as string[]
  });
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [newVideo, setNewVideo] = useState<Partial<Video>>({
    name: '',
    videoUrl: '',
    duration: 0,
    authors: [],
    educationCycle: {
      level: 'FUNDAMENTAL',
      cycle: 'ANOS_INICIAIS'
    }
  });
  const [authorInput, setAuthorInput] = useState('');

  useEffect(() => {
    loadCollection();
    loadAvailableVideos();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // This would be replaced with an actual API call
      // For now, we'll use mock data
      const mockCollection: Collection = {
        id: collectionId,
        name: 'Matemática Básica',
        synopsis: 'Coleção de vídeos sobre matemática básica para o ensino fundamental',
        coverImage: '/placeholder-thumbnail.png',
        supportMaterial: 'https://example.com/math-support-material.pdf',
        totalDuration: 3600, // 1 hour
        subject: 'Matemática',
        modules: [
          {
            id: 'module-1',
            name: 'Introdução à Álgebra',
            description: 'Conceitos básicos de álgebra',
            coverImage: '/placeholder-thumbnail.png',
            videoIds: ['video-1', 'video-2'],
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ],
        tags: ['matemática', 'fundamental'],
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCollection(mockCollection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableVideos = async () => {
    try {
      // This would be replaced with an actual API call
      // Mock videos for now
      const mockVideos: Video[] = [
        {
          id: 'video-1',
          name: 'Introdução à Álgebra - Parte 1',
          moduleId: 'module-1',
          videoUrl: 'https://example.com/videos/algebra-intro-1.mp4',
          duration: 600, // 10 minutes
          authors: ['Prof. João Silva'],
          educationCycle: {
            level: 'FUNDAMENTAL',
            cycle: 'ANOS_FINAIS',
            grade: 'SEXTO_ANO'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'video-2',
          name: 'Introdução à Álgebra - Parte 2',
          moduleId: 'module-1',
          videoUrl: 'https://example.com/videos/algebra-intro-2.mp4',
          duration: 720, // 12 minutes
          authors: ['Prof. João Silva'],
          educationCycle: {
            level: 'FUNDAMENTAL',
            cycle: 'ANOS_FINAIS',
            grade: 'SEXTO_ANO'
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setAvailableVideos(mockVideos);
    } catch (err) {
      console.error('Failed to load available videos', err);
    }
  };

  const handleCreateModule = async () => {
    try {
      if (!newModule.name.trim()) {
        setError('Nome do módulo é obrigatório');
        return;
      }

      if (!collection) return;

      // This would be replaced with an actual API call
      const newModuleData: Module = {
        id: `module_${Date.now()}`,
        name: newModule.name,
        description: newModule.description,
        coverImage: newModule.coverImage || collection.coverImage,
        videoIds: selectedVideos,
        order: collection.modules.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedCollection = {
        ...collection,
        modules: [...collection.modules, newModuleData]
      };

      setCollection(updatedCollection);
      setShowCreateModal(false);
      setNewModule({
        name: '',
        description: '',
        coverImage: '',
        videoIds: []
      });
      setSelectedVideos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create module');
    }
  };

  const handleUpdateModule = async () => {
    try {
      if (!selectedModule || !collection) return;

      if (!selectedModule.name.trim()) {
        setError('Nome do módulo é obrigatório');
        return;
      }

      // This would be replaced with an actual API call
      const updatedModules = collection.modules.map(module => 
        module.id === selectedModule.id ? { ...selectedModule, videoIds: selectedVideos } : module
      );

      const updatedCollection = {
        ...collection,
        modules: updatedModules
      };

      setCollection(updatedCollection);
      setSelectedModule(null);
      setSelectedVideos([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Tem certeza que deseja excluir este módulo?')) return;
    if (!collection) return;

    try {
      // This would be replaced with an actual API call
      const updatedModules = collection.modules.filter(module => module.id !== moduleId);
      
      const updatedCollection = {
        ...collection,
        modules: updatedModules
      };

      setCollection(updatedCollection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete module');
    }
  };

  const handleEditModule = (module: Module) => {
    setSelectedModule(module);
    setSelectedVideos(module.videoIds);
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const getVideoById = (videoId: string) => {
    return availableVideos.find(video => video.id === videoId);
  };
  
  const handleAddVideo = async () => {
    try {
      if (!newVideo.name || !newVideo.videoUrl) {
        setError('Nome e URL do vídeo são obrigatórios');
        return;
      }
      
      if (!selectedModule) return;
      
      // This would be replaced with an actual API call
      const videoData: Video = {
        id: `video_${Date.now()}`,
        name: newVideo.name || '',
        moduleId: selectedModule.id,
        videoUrl: newVideo.videoUrl || '',
        duration: newVideo.duration || 0,
        authors: newVideo.authors || [],
        educationCycle: newVideo.educationCycle || {
          level: 'FUNDAMENTAL',
          cycle: 'ANOS_INICIAIS'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to available videos
      setAvailableVideos(prev => [...prev, videoData]);
      
      // Add to selected videos
      setSelectedVideos(prev => [...prev, videoData.id]);
      
      // Reset form
      setNewVideo({
        name: '',
        videoUrl: '',
        duration: 0,
        authors: [],
        educationCycle: {
          level: 'FUNDAMENTAL',
          cycle: 'ANOS_INICIAIS'
        }
      });
      
      setShowVideoModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
    }
  };
  
  const handleAuthorAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && authorInput.trim()) {
      e.preventDefault();
      if (!newVideo.authors?.includes(authorInput.trim())) {
        setNewVideo(prev => ({
          ...prev,
          authors: [...(prev.authors || []), authorInput.trim()]
        }));
      }
      setAuthorInput('');
    }
  };
  
  const removeAuthor = (authorToRemove: string) => {
    setNewVideo(prev => ({
      ...prev,
      authors: prev.authors?.filter(author => author !== authorToRemove) || []
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {collection ? `Módulos: ${collection.name}` : 'Carregando...'}
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Novo Módulo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando módulos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : !collection ? (
        <div className="text-center py-12 text-gray-500">
          Coleção não encontrada
        </div>
      ) : collection.modules.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nenhum módulo encontrado nesta coleção
        </div>
      ) : (
        <div className="space-y-4">
          {collection.modules.map(module => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{module.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditModule(module)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
                    >
                      Excluir
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vídeos:</h4>
                  {module.videoIds.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhum vídeo adicionado</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {module.videoIds.map(videoId => {
                        const video = getVideoById(videoId);
                        return video ? (
                          <div
                            key={videoId}
                            className="flex items-center p-2 bg-gray-50 rounded"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden mr-2 flex items-center justify-center">
                              <span className="material-symbols-outlined text-gray-400">
                                play_circle
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{video.name}</p>
                              <p className="text-xs text-gray-500">
                                {Math.floor(video.duration / 60)} minutos | {video.authors.join(', ')}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div key={videoId} className="text-sm text-gray-500">
                            Vídeo não encontrado (ID: {videoId})
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Module Modal */}
      {(showCreateModal || selectedModule) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {selectedModule ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={selectedModule ? selectedModule.name : newModule.name}
                  onChange={e => selectedModule 
                    ? setSelectedModule({...selectedModule, name: e.target.value})
                    : setNewModule(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Nome do módulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={selectedModule ? selectedModule.description : newModule.description}
                  onChange={e => selectedModule
                    ? setSelectedModule({...selectedModule, description: e.target.value})
                    : setNewModule(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição do módulo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem de Capa (URL)
                </label>
                <input
                  type="text"
                  value={selectedModule ? selectedModule.coverImage : newModule.coverImage}
                  onChange={e => selectedModule
                    ? setSelectedModule({...selectedModule, coverImage: e.target.value})
                    : setNewModule(prev => ({ ...prev, coverImage: e.target.value }))
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="URL da imagem de capa"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para usar a mesma imagem da coleção
                </p>
              </div>

              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Vídeos
                </label>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Adicionar Vídeo
                </button>
              </div>
              
              <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                {availableVideos.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum vídeo disponível</p>
                ) : (
                  <div className="space-y-2">
                    {availableVideos.map(video => (
                      <div
                        key={video.id}
                        className={`flex items-center p-2 rounded cursor-pointer ${
                          selectedVideos.includes(video.id)
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => toggleVideoSelection(video.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(video.id)}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden mr-2 flex items-center justify-center">
                          <span className="material-symbols-outlined text-gray-400">
                            play_circle
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{video.name}</p>
                          <p className="text-xs text-gray-500">
                            {Math.floor(video.duration / 60)} minutos | {video.authors.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedModule(null);
                  setSelectedVideos([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={selectedModule ? handleUpdateModule : handleCreateModule}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {selectedModule ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Adicionar Vídeo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={newVideo.name}
                  onChange={e => setNewVideo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Nome do vídeo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Vídeo
                </label>
                <input
                  type="text"
                  value={newVideo.videoUrl}
                  onChange={e => setNewVideo(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="URL do vídeo (S3)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Em produção, será substituído por um upload para o S3
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={newVideo.duration ? Math.floor(newVideo.duration / 60) : ''}
                  onChange={e => setNewVideo(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value || '0') * 60 
                  }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Duração em minutos"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autores
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newVideo.authors?.map(author => (
                    <span
                      key={author}
                      className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center"
                    >
                      {author}
                      <button
                        onClick={() => removeAuthor(author)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={authorInput}
                  onChange={e => setAuthorInput(e.target.value)}
                  onKeyDown={handleAuthorAdd}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite autores e pressione Enter"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nível de Ensino
                </label>
                <select
                  value={newVideo.educationCycle?.level}
                  onChange={e => setNewVideo(prev => ({ 
                    ...prev, 
                    educationCycle: { 
                      ...prev.educationCycle!, 
                      level: e.target.value as any 
                    } 
                  }))}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="INFANTIL">Educação Infantil</option>
                  <option value="FUNDAMENTAL">Ensino Fundamental</option>
                  <option value="MEDIO">Ensino Médio</option>
                </select>
              </div>
              
              {newVideo.educationCycle?.level === 'FUNDAMENTAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciclo
                  </label>
                  <select
                    value={newVideo.educationCycle?.cycle}
                    onChange={e => setNewVideo(prev => ({ 
                      ...prev, 
                      educationCycle: { 
                        ...prev.educationCycle!, 
                        cycle: e.target.value 
                      } 
                    }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="ANOS_INICIAIS">Anos Iniciais</option>
                    <option value="ANOS_FINAIS">Anos Finais</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddVideo}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
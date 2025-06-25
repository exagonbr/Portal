'use client'

import React, { useState, useEffect } from 'react'
import { CollectionFormData, VideoModule, CollectionWithVideos } from '@/types/collections'
import CollectionForm from '@/components/collections/CollectionForm'
import VideoModuleForm from '@/components/collections/VideoModuleForm'

interface CollectionListItem {
  id: number
  name: string
  producer: string
  total_hours: string
  video_count: number
  created_at: string
  poster_image?: string
}

export default function CollectionsManagePage() {
  const [collections, setCollections] = useState<CollectionListItem[]>([])
  const [selectedCollection, setSelectedCollection] = useState<CollectionWithVideos | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'videos' | 'video-form'>('list')
  const [editingCollection, setEditingCollection] = useState<Partial<CollectionFormData> | null>(null)
  const [editingVideo, setEditingVideo] = useState<Partial<VideoModule> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/collections/manage')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections)
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCollectionDetails = async (id: number) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/manage/${id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCollection(data.collection)
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da coleção:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCollection = async (data: CollectionFormData) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/collections/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await loadCollections()
        setCurrentView('list')
        setEditingCollection(null)
      }
    } catch (error) {
      console.error('Erro ao criar coleção:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateCollection = async (data: CollectionFormData) => {
    if (!editingCollection?.id) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/manage/${editingCollection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        await loadCollections()
        if (selectedCollection?.id === editingCollection.id) {
          await loadCollectionDetails(editingCollection.id)
        }
        setCurrentView('list')
        setEditingCollection(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar coleção:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCollection = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta coleção?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/manage/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadCollections()
        if (selectedCollection?.id === id) {
          setSelectedCollection(null)
          setCurrentView('list')
        }
      }
    } catch (error) {
      console.error('Erro ao excluir coleção:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVideo = async (data: VideoModule) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/collections/manage/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        if (selectedCollection) {
          await loadCollectionDetails(selectedCollection.id)
        }
        setCurrentView('videos')
        setEditingVideo(null)
      }
    } catch (error) {
      console.error('Erro ao criar vídeo:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateVideo = async (data: VideoModule) => {
    if (!editingVideo?.id) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/manage/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        if (selectedCollection) {
          await loadCollectionDetails(selectedCollection.id)
        }
        setCurrentView('videos')
        setEditingVideo(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteVideo = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return

    try {
      setIsLoading(true)
      const response = await fetch(`/api/collections/manage/videos/${id}`, {
        method: 'DELETE'
      })

      if (response.ok && selectedCollection) {
        await loadCollectionDetails(selectedCollection.id)
      }
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.producer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedVideos = selectedCollection?.videos.reduce((acc, video) => {
    const moduleKey = `module_${video.module_number}`
    if (!acc[moduleKey]) {
      acc[moduleKey] = []
    }
    acc[moduleKey].push(video)
    return acc
  }, {} as Record<string, VideoModule[]>) || {}

  // Renderização condicional baseada na view atual
  if (currentView === 'form') {
    return (
      <CollectionForm
        initialData={editingCollection || undefined}
        onSubmit={editingCollection?.id ? handleUpdateCollection : handleCreateCollection}
        onCancel={() => {
          setCurrentView('list')
          setEditingCollection(null)
        }}
        isLoading={isLoading}
      />
    )
  }

  if (currentView === 'video-form' && selectedCollection) {
    return (
      <VideoModuleForm
        initialData={editingVideo || undefined}
        collectionId={selectedCollection.id}
        collectionPosterUrl={selectedCollection.poster_image}
        useDefaultCover={selectedCollection.use_default_cover_for_videos}
        onSubmit={editingVideo?.id ? handleUpdateVideo : handleCreateVideo}
        onCancel={() => {
          setCurrentView('videos')
          setEditingVideo(null)
        }}
        isLoading={isLoading}
      />
    )
  }

  if (currentView === 'videos' && selectedCollection) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center text-blue-600 hover:text-blue-700 mb-2"
              >
                <span className="material-symbols-outlined mr-1">arrow_back</span>
                Voltar às Coleções
              </button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {selectedCollection.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Gerenciar vídeos da coleção
              </p>
            </div>
            <button
              onClick={() => {
                setEditingVideo(null)
                setCurrentView('video-form')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="material-symbols-outlined mr-2">add</span>
              Novo Vídeo
            </button>
          </div>
        </div>

        {/* Vídeos por Módulo */}
        <div className="space-y-8">
          {Object.keys(groupedVideos).length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
                video_library
              </span>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Nenhum vídeo encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Comece adicionando o primeiro vídeo à coleção
              </p>
              <button
                onClick={() => {
                  setEditingVideo(null)
                  setCurrentView('video-form')
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Adicionar Primeiro Vídeo
              </button>
            </div>
          ) : (
            Object.entries(groupedVideos)
              .sort(([a], [b]) => {
                const moduleA = parseInt(a.split('_')[1])
                const moduleB = parseInt(b.split('_')[1])
                return moduleA - moduleB
              })
              .map(([moduleKey, videos]) => {
                const moduleNumber = parseInt(moduleKey.split('_')[1])
                const sortedVideos = videos.sort((a, b) => a.order_in_module - b.order_in_module)

                return (
                  <div key={moduleKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Módulo {moduleNumber}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {sortedVideos.map((video) => (
                        <div key={video.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                              {video.title}
                            </h3>
                            <div className="flex space-x-1 ml-2">
                              <button
                                onClick={() => {
                                  setEditingVideo(video)
                                  setCurrentView('video-form')
                                }}
                                className="p-1 text-blue-600 hover:text-blue-700"
                                title="Editar"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteVideo(video.id!)}
                                className="p-1 text-red-600 hover:text-red-700"
                                title="Excluir"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {video.synopsis}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Ordem: {video.order_in_module}</span>
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
          )}
        </div>
      </div>
    )
  }

  // View principal - Lista de coleções
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gerenciar Coleções
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crie e gerencie coleções de vídeos educacionais
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCollection(null)
              setCurrentView('form')
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <span className="material-symbols-outlined mr-2">add</span>
            Nova Coleção
          </button>
        </div>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar coleções..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Lista de Coleções */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-gray-400 mb-4 block">
            video_library
          </span>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'Nenhuma coleção encontrada' : 'Nenhuma coleção criada'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca'
              : 'Comece criando sua primeira coleção de vídeos'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setEditingCollection(null)
                setCurrentView('form')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Criar Primeira Coleção
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map((collection) => (
            <div key={collection.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {collection.poster_image && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700">
                  <img
                    src={collection.poster_image}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {collection.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {collection.producer}
                </p>
                <div className="flex justify-between text-sm text-gray-500 mb-4">
                  <span>{collection.video_count} vídeos</span>
                  <span>{collection.total_hours}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      loadCollectionDetails(collection.id)
                      setCurrentView('videos')
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Gerenciar Vídeos
                  </button>
                  <button
                    onClick={() => {
                      setEditingCollection({ id: collection.id })
                      setCurrentView('form')
                    }}
                    className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    title="Editar"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.id)}
                    className="p-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect, useMemo } from 'react'
import { FileService } from '@/services/fileService'
import { BucketService } from '@/services/bucketService'
import { S3FileInfo } from '@/types/files'

const CONTENT_TYPES = ['Todos', 'PDF', 'DOCX', 'PPTX', 'EPUB', 'ZIP', 'MP4', 'MP3']
const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'date', label: 'Data de Modificação' },
  { value: 'size', label: 'Tamanho' },
  { value: 'type', label: 'Tipo' }
]

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100, 200, 500]
const DEFAULT_ITEMS_PER_PAGE = 50

interface BucketInfo {
  name: string
  label: string
  category: string
  description: string
}

interface ProgressInfo {
  current: number
  total: number
  isLoading: boolean
}

export default function AdminContentSearchPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [contentType, setContentType] = useState('Todos')
  const [sortBy, setSortBy] = useState('name')
  
  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE)
  
  // Estados para buckets e conteúdo
  const [availableBuckets, setAvailableBuckets] = useState<BucketInfo[]>([])
  const [activeTab, setActiveTab] = useState('')
  const [contents, setContents] = useState<Record<string, S3FileInfo[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bucketsLoading, setBucketsLoading] = useState(true)
  
  // Estado para progress bar
  const [progress, setProgress] = useState<ProgressInfo>({
    current: 0,
    total: 0,
    isLoading: false
  })
  
  // Estados para modais e ações
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateRefModal, setShowCreateRefModal] = useState(false)
  const [showBucketModal, setShowBucketModal] = useState(false)
  const [showLinkCollectionModal, setShowLinkCollectionModal] = useState(false)
  const [showAddLibraryModal, setShowAddLibraryModal] = useState(false)
  const [showUnlinkModal, setShowUnlinkModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<S3FileInfo | null>(null)
  const [newName, setNewName] = useState('')
  const [targetBucket, setTargetBucket] = useState('')
  const [moveAction, setMoveAction] = useState<'copy' | 'move'>('copy')
  const [refDescription, setRefDescription] = useState('')
  const [refTags, setRefTags] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('')
  const [libraryCategory, setLibraryCategory] = useState('')

  // Estados para adicionar bucket
  const [newBucketName, setNewBucketName] = useState('')
  const [newBucketLabel, setNewBucketLabel] = useState('')
  const [newBucketCategory, setNewBucketCategory] = useState('')
  const [newBucketDescription, setNewBucketDescription] = useState('')

  // Estados específicos para livros
  const [bookTitle, setBookTitle] = useState('')
  const [bookAuthor, setBookAuthor] = useState('')
  const [bookPublisher, setBookPublisher] = useState('')
  const [bookDescription, setBookDescription] = useState('')

  // Carregar buckets ao montar o componente
  useEffect(() => {
    const initializeData = async () => {
      await loadBuckets()
      // Após carregar os buckets, carregar todos os arquivos se a aba for "todos"
      if (activeTab === 'todos' || !activeTab) {
        await loadAllFiles()
      }
    }
    initializeData()
  }, [])

  // Carregar arquivos quando mudar aba ativa
  useEffect(() => {
    if (activeTab === 'todos') {
      loadAllFiles()
    } else if (activeTab) {
      loadFiles()
    }
  }, [activeTab])

  // Reset página quando filtros ou itens por página mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, contentType, sortBy, activeTab, itemsPerPage])

  const loadBuckets = async () => {
    setBucketsLoading(true)
    setError(null)
    try {
      const buckets = await BucketService.getConfiguredBuckets()
      setAvailableBuckets(buckets)
      
      // Definir aba "todos" como ativa por padrão
      if (buckets.length > 0 && !activeTab) {
        setActiveTab('todos')
      }
      
      // Inicializar estado de contents para todos os buckets
      const initialContents: Record<string, S3FileInfo[]> = {}
      buckets.forEach(bucket => {
        initialContents[bucket.category] = []
      })
      setContents(initialContents)
      
    } catch (err) {
      console.log('Erro ao carregar buckets:', err)
      setError('Erro ao carregar buckets. Tente novamente.')
    } finally {
      setBucketsLoading(false)
    }
  }

  const loadFiles = async () => {
    if (!activeTab) return
    
    setLoading(true)
    setProgress({ current: 0, total: 100, isLoading: true })
    setError(null)
    
    try {
      // Simular progresso de carregamento
      const updateProgress = (current: number) => {
        setProgress(prev => ({ ...prev, current }))
      }

      updateProgress(20)
      
      // Buscar bucket info para a aba ativa
      const activeBucket = availableBuckets.find(bucket => bucket.category === activeTab)
      if (!activeBucket) {
        throw new Error(`Bucket não encontrado para a categoria: ${activeTab}`)
      }
      
      console.log(`Carregando arquivos do bucket: ${activeBucket.name} (categoria: ${activeTab})`)
      
      // Buscar TODOS os arquivos do bucket específico
      const allBucketFiles = await FileService.getAllBucketFiles(activeTab)
      updateProgress(60)
      
      updateProgress(80)
      
      // Mapear arquivos do bucket sem verificação de referências (método removido)
      const combinedFiles = allBucketFiles.map((bucketFile: S3FileInfo) => {
        return {
          ...bucketFile,
          hasDbReference: false, // Temporariamente false até implementar nova verificação
          dbRecord: null,
          bucket: activeBucket.name, // Garantir que o bucket está correto
          category: activeTab // Adicionar categoria para facilitar filtragem
        }
      })
      
      updateProgress(100)
      
      console.log(`Carregados ${combinedFiles.length} arquivos para a categoria ${activeTab}`)
      
      setContents(prev => ({
        ...prev,
        [activeTab]: combinedFiles
      }))
    } catch (err) {
      console.log('Erro ao carregar arquivos:', err)
      setError(`Erro ao carregar arquivos da categoria ${activeTab}. Tente novamente.`)
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0, isLoading: false })
    }
  }

  const loadAllFiles = async () => {
    setLoading(true)
    setProgress({ current: 0, total: availableBuckets.length, isLoading: true })
    setError(null)
    
    try {
      const allFiles: Record<string, S3FileInfo[]> = {}
      
      for (let i = 0; i < availableBuckets.length; i++) {
        const bucket = availableBuckets[i]
        setProgress(prev => ({ ...prev, current: i + 1 }))
        
        console.log(`Carregando bucket ${i + 1}/${availableBuckets.length}: ${bucket.name} (${bucket.category})`)
        
        try {
          // Carregar arquivos do bucket específico
          const allBucketFiles = await FileService.getAllBucketFiles(bucket.category)
          
          // Mapear dados sem verificação de referências (método removido)
          const combinedFiles = allBucketFiles.map((bucketFile: S3FileInfo) => {
            return {
              ...bucketFile,
              hasDbReference: false, // Temporariamente false até implementar nova verificação
              dbRecord: null,
              bucket: bucket.name,
              category: bucket.category
            }
          })
          
          allFiles[bucket.category] = combinedFiles
          console.log(`✓ Carregados ${combinedFiles.length} arquivos para ${bucket.category}`)
          
        } catch (bucketError) {
          console.log(`Erro ao carregar bucket ${bucket.category}:`, bucketError)
          allFiles[bucket.category] = [] // Adicionar array vazio em caso de erro
        }
      }
      
      setContents(allFiles)
      console.log('✅ Todos os buckets carregados com sucesso')
      
    } catch (err) {
      console.log('Erro ao carregar todos os arquivos:', err)
      setError('Erro ao carregar arquivos de alguns buckets. Tente novamente.')
    } finally {
      setLoading(false)
      setProgress({ current: 0, total: 0, isLoading: false })
    }
  }

  const addNewBucket = async () => {
    if (!newBucketName || !newBucketLabel || !newBucketCategory) {
      setError('Nome, label e categoria são obrigatórios')
      return
    }

    try {
      setLoading(true)
      await BucketService.addBucket({
        name: newBucketName,
        label: newBucketLabel,
        category: newBucketCategory,
        description: newBucketDescription
      })
      
      // Recarregar buckets
      await loadBuckets()
      
      // Limpar form
      setNewBucketName('')
      setNewBucketLabel('')
      setNewBucketCategory('')
      setNewBucketDescription('')
      setShowBucketModal(false)
      
    } catch (err) {
      console.log('Erro ao adicionar bucket:', err)
      setError('Erro ao adicionar bucket. Verifique se o bucket existe na AWS.')
    } finally {
      setLoading(false)
    }
  }

  // Função para filtrar e ordenar conteúdo com paginação
  const getFilteredContent = useMemo(() => {
    let content: S3FileInfo[] = []
    
    // Se a aba ativa for "todos", combinar todos os arquivos
    if (activeTab === 'todos') {
      content = Object.values(contents).flat()
    } else {
      content = contents[activeTab] || []
    }
    
    // Filtrar por termo de busca
    if (searchTerm) {
      content = content.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Filtrar por tipo
    if (contentType !== 'Todos') {
      content = content.filter(item => item.type === contentType)
    }
    
    // Ordenar
    content.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        case 'size':
          return parseFloat(a.size) - parseFloat(b.size)
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })
    
    return content
  }, [contents, activeTab, searchTerm, contentType, sortBy])

  // Calcular páginas paginadas
  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return getFilteredContent.slice(startIndex, endIndex)
  }, [getFilteredContent, currentPage, itemsPerPage])

  // Atualizar total de páginas quando conteúdo filtrado mudar
  useEffect(() => {
    const pages = Math.ceil(getFilteredContent.length / itemsPerPage)
    setTotalPages(pages)
  }, [getFilteredContent.length, itemsPerPage])

  // Funções de ação
  const handleView = (item: S3FileInfo) => {
    window.open(item.url, '_blank')
  }

  const handleReplace = async (item: S3FileInfo) => {
    setSelectedItem(item)
    fileInputRef.current?.click()
  }

  const handleFileReplace = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && selectedItem) {
      try {
        setLoading(true)
        await FileService.replaceFile(selectedItem.dbRecord?.id || selectedItem.id, file)
        await loadFiles() // Recarregar dados
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao substituir arquivo:', error)
        setError('Erro ao substituir arquivo')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRename = async () => {
    if (selectedItem && newName) {
      try {
        setLoading(true)
        await FileService.renameFile(selectedItem.dbRecord?.id || selectedItem.id, newName)
        await loadFiles()
        setShowRenameModal(false)
        setNewName('')
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao renomear arquivo:', error)
        setError('Erro ao renomear arquivo')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleMove = async () => {
    if (selectedItem && targetBucket) {
      try {
        setLoading(true)
        await FileService.moveFile({
          fileId: selectedItem.dbRecord?.id || selectedItem.id,
          sourceBucket: selectedItem.bucket,
          targetBucket: targetBucket,
          action: moveAction
        })
        await loadFiles()
        setShowMoveModal(false)
        setTargetBucket('')
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao mover arquivo:', error)
        setError('Erro ao mover arquivo')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDelete = async () => {
    if (selectedItem) {
      try {
        setLoading(true)
        await FileService.deleteFile(selectedItem.dbRecord?.id || selectedItem.id)
        await loadFiles()
        setShowDeleteModal(false)
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao deletar arquivo:', error)
        setError('Erro ao deletar arquivo')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleCreateReference = async () => {
    if (selectedItem) {
      try {
        setLoading(true)
        await FileService.createDatabaseReference(
          selectedItem.name, 
          activeTab, 
          {
            name: selectedItem.name,
            description: refDescription,
            tags: refTags.split(',').map(tag => tag.trim()).filter(tag => tag)
          }
        )
        await loadFiles()
        setShowCreateRefModal(false)
        setRefDescription('')
        setRefTags('')
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao criar referência:', error)
        setError('Erro ao criar referência no banco')
      } finally {
        setLoading(false)
      }
    }
  }

  const openRenameModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setNewName(item.name)
    setShowRenameModal(true)
  }

  const openMoveModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setShowMoveModal(true)
  }

  const openDeleteModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setShowDeleteModal(true)
  }

  const openCreateRefModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setRefDescription(item.description)
    setShowCreateRefModal(true)
  }

  // Funções para vincular a coleção e adicionar à biblioteca
  const handleLinkToCollection = async () => {
    if (selectedItem && selectedCollection) {
      try {
        setLoading(true)
        await FileService.linkToCollection(selectedItem.id, selectedCollection)
        await loadFiles()
        setShowLinkCollectionModal(false)
        setSelectedCollection('')
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao vincular à coleção:', error)
        setError('Erro ao vincular arquivo à coleção')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddToLibrary = async () => {
    if (selectedItem && libraryCategory && bookTitle.trim()) {
      try {
        setLoading(true)
        // Adicionar especificamente ao portal de livros (books)
        await FileService.addToBookLibrary(selectedItem.id, {
          title: bookTitle.trim(),
          author: bookAuthor.trim() || 'Autor não informado',
          publisher: bookPublisher.trim() || 'Editora não informada',
          format: selectedItem.type,
          category: libraryCategory,
          thumbnail: `/api/content/files/${selectedItem.id}/thumbnail`,
          fileUrl: selectedItem.url,
          fileSize: selectedItem.size,
          description: bookDescription.trim() || 'Descrição não disponível'
        })
        await loadFiles()
        setShowAddLibraryModal(false)
        setLibraryCategory('')
        setBookTitle('')
        setBookAuthor('')
        setBookPublisher('')
        setBookDescription('')
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao adicionar à biblioteca de livros:', error)
        setError('Erro ao adicionar arquivo à biblioteca de livros')
      } finally {
        setLoading(false)
      }
    }
  }

  const openLinkCollectionModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setShowLinkCollectionModal(true)
  }

  const openAddLibraryModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setBookTitle(item.name?.replace(/\.[^/.]+$/, "") || item.name || "") // Remove extensão
    setBookAuthor('Autor não informado')
    setBookPublisher('Editora não informada')
    setBookDescription(item.description || 'Descrição não disponível')
    setShowAddLibraryModal(true)
  }

  // Função para desvincular arquivo do conteúdo
  const handleUnlinkFromContent = async () => {
    if (selectedItem) {
      try {
        setLoading(true)
        await FileService.unlinkFromContent(selectedItem.id)
        await loadFiles()
        setShowUnlinkModal(false)
        setSelectedItem(null)
      } catch (error) {
        console.log('Erro ao desvincular arquivo:', error)
        setError('Erro ao desvincular arquivo')
      } finally {
        setLoading(false)
      }
    }
  }

  const openUnlinkModal = (item: S3FileInfo) => {
    setSelectedItem(item)
    setShowUnlinkModal(true)
  }

  if (bucketsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando buckets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-600 mb-2">Gerenciamento de Conteúdo</h1>
          <p className="text-gray-600">Gerencie arquivos nos buckets S3 da AWS e suas referências no banco de dados</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBucketModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Adicionar Bucket</span>
          </button>
          <button
            onClick={loadAllFiles}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{loading ? 'Carregando...' : 'Atualizar Todos'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {progress.isLoading && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Carregando arquivos...</span>
            <span className="text-sm text-gray-600">
              {progress.total > 1 ? `${progress.current}/${progress.total}` : `${progress.current}%`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: progress.total > 1 
                  ? `${(progress.current / progress.total) * 100}%`
                  : `${progress.current}%`
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex">
            <span className="material-symbols-outlined mr-2">error</span>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Info sobre buckets */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
        <div className="flex items-center mb-2">
          <span className="material-symbols-outlined text-blue-600 mr-2">info</span>
          <h3 className="font-medium text-blue-800">Buckets Configurados ({availableBuckets.length})</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          {availableBuckets.map((bucket, index) => (
            <div key={index} className="bg-white p-2 rounded border">
              <div className="font-medium text-blue-700">{bucket.label}</div>
              <div className="text-gray-600 text-xs">{bucket.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros Globais */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-600">Filtros</h2>
          <button
            onClick={loadFiles}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{loading ? 'Carregando...' : 'Atualizar'}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar por Nome</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o nome do arquivo..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CONTENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Abas */}
      {availableBuckets.length > 0 && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {/* Aba Todos */}
              <button
                onClick={() => setActiveTab('todos')}
                disabled={loading}
                className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-3 transition-all duration-200 disabled:cursor-not-allowed ${
                  activeTab === 'todos'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="material-symbols-outlined text-lg">folder</span>
                <div className="flex flex-col items-start">
                  <span className="font-semibold">Todos os Arquivos</span>
                  <span className="text-xs text-gray-500">Todos os buckets</span>
                </div>
                
                {loading && activeTab === 'todos' ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                      {Object.values(contents).flat().length}
                    </span>
                    {Object.values(contents).flat().length > 0 && (
                      <span className="text-xs text-green-600 font-medium">
                        {Object.values(contents).flat().filter(file => file.hasDbReference).length} vinculados
                      </span>
                    )}
                  </div>
                )}
              </button>

              {/* Abas dos buckets */}
              {availableBuckets.map((bucket) => {
                const isActive = activeTab === bucket.category
                const filesCount = contents[bucket.category]?.length || 0
                const linkedCount = contents[bucket.category]?.filter(file => file.hasDbReference).length || 0
                const isLoading = loading && isActive
                
                return (
                  <button
                    key={bucket.category}
                    onClick={() => setActiveTab(bucket.category)}
                    disabled={loading}
                    className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center space-x-3 transition-all duration-200 disabled:cursor-not-allowed ${
                      isActive
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {bucket.category === 'literario' ? 'book' : 
                       bucket.category === 'professor' ? 'school' : 'person'}
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{bucket.label}</span>
                      <span className="text-xs text-gray-500">{bucket.name}</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                          {filesCount}
                        </span>
                        {filesCount > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {linkedCount} vinculados
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
          
          {/* Informações da aba ativa */}
          {activeTab && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <div>
                    <h3 className="font-medium text-blue-800">
                      {activeTab === 'todos' 
                        ? 'Todos os Arquivos' 
                        : availableBuckets.find(b => b.category === activeTab)?.label}
                    </h3>
                    <p className="text-blue-600 text-sm">
                      {activeTab === 'todos' 
                        ? `${availableBuckets.length} buckets configurados` 
                        : `Bucket: ${availableBuckets.find(b => b.category === activeTab)?.name}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-blue-800">
                      {activeTab === 'todos' 
                        ? Object.values(contents).flat().length 
                        : contents[activeTab]?.length || 0}
                    </div>
                    <div className="text-blue-600">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-600">
                      {activeTab === 'todos'
                        ? Object.values(contents).flat().filter(file => file.hasDbReference).length
                        : contents[activeTab]?.filter(file => file.hasDbReference).length || 0}
                    </div>
                    <div className="text-green-600">Vinculados</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-600">
                      {activeTab === 'todos'
                        ? Object.values(contents).flat().filter(file => !file.hasDbReference).length
                        : contents[activeTab]?.filter(file => !file.hasDbReference).length || 0}
                    </div>
                    <div className="text-red-600">Não vinculados</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lista de Conteúdo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Indicador de quantidade de arquivos */}
        {getFilteredContent.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Exibindo <span className="font-bold">{paginatedContent.length}</span> de{' '}
                <span className="font-bold">{getFilteredContent.length}</span> arquivos
                {searchTerm && ` (filtrado por: "${searchTerm}")`}
                {contentType !== 'Todos' && ` (tipo: ${contentType})`}
              </p>
              {activeTab === 'todos' && (
                <p className="text-sm text-gray-600">
                  De <span className="font-bold">{availableBuckets.length}</span> buckets diferentes
                </p>
              )}
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivo
                </th>
                {activeTab === 'todos' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bucket
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamanho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modificado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referência DB
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContent.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${!item.hasDbReference ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <span className="material-symbols-outlined text-blue-600">
                            {item.type === 'PDF' ? 'picture_as_pdf' : 
                             item.type === 'DOCX' ? 'description' :
                             item.type === 'PPTX' ? 'slideshow' :
                             item.type === 'EPUB' ? 'book' :
                             item.type === 'MP4' ? 'video_file' :
                             item.type === 'MP3' ? 'audio_file' :
                             'folder_zip'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-700 flex items-center">
                          {item.name}
                          {!item.hasDbReference && (
                            <span className="ml-2 material-symbols-outlined text-red-500 text-sm" title="Sem referência no banco">
                              warning
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  {activeTab === 'todos' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-700">
                          {availableBuckets.find(b => b.category === item.category)?.label || item.category}
                        </div>
                        <div className="text-gray-500 text-xs">{item.bucket}</div>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(item.lastModified).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.hasDbReference ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-green-600">
                          <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                          <span className="text-xs">Vinculado</span>
                        </div>
                        <button
                          onClick={() => openUnlinkModal(item)}
                          className="text-red-600 hover:text-red-800 text-xs underline"
                          title="Desvincular arquivo"
                        >
                          Desvincular
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-red-600">
                          <span className="material-symbols-outlined text-sm mr-1">error</span>
                          <span className="text-xs">Não vinculado</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openCreateRefModal(item)}
                            className="text-blue-600 hover:text-blue-800 text-xs underline"
                            title="Criar referência no banco"
                          >
                            Criar
                          </button>
                          <button
                            onClick={() => openLinkCollectionModal(item)}
                            className="text-green-600 hover:text-green-800 text-xs underline"
                            title="Vincular à coleção"
                          >
                            Coleção
                          </button>
                          <button
                            onClick={() => openAddLibraryModal(item)}
                            className="text-purple-600 hover:text-purple-800 text-xs underline"
                            title="Adicionar à biblioteca"
                          >
                            Biblioteca
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      {/* Ações básicas - disponíveis para todos */}
                      <button
                        onClick={() => handleView(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Visualizar"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      
                      <button
                        onClick={() => openRenameModal(item)}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                        title="Renomear arquivo"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleReplace(item)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Substituir arquivo"
                      >
                        <span className="material-symbols-outlined text-sm">file_upload</span>
                      </button>
                      
                      <button
                        onClick={() => openMoveModal(item)}
                        className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                        title="Mover/Copiar para outro bucket"
                      >
                        <span className="material-symbols-outlined text-sm">drive_file_move</span>
                      </button>
                      
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Deletar arquivo"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {getFilteredContent.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            {/* Mobile */}
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700 flex items-center">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
            
            {/* Desktop */}
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}até{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, getFilteredContent.length)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{getFilteredContent.length}</span>
                  {' '}resultados
                </p>
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Mostrar:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                    {getFilteredContent.length <= 500 && (
                      <option value={getFilteredContent.length}>Todos ({getFilteredContent.length})</option>
                    )}
                  </select>
                  <span className="text-sm text-gray-700">por página</span>
                </div>
              </div>
              
              {totalPages > 1 && (
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {/* Primeira página */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      title="Primeira página"
                    >
                      <span className="material-symbols-outlined text-sm">first_page</span>
                    </button>
                    
                    {/* Página anterior */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      title="Página anterior"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    
                    {/* Números das páginas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    })}
                    
                    {/* Próxima página */}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      title="Próxima página"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                    
                    {/* Última página */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      title="Última página"
                    >
                      <span className="material-symbols-outlined text-sm">last_page</span>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando arquivos...</p>
          </div>
        ) : getFilteredContent.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">folder_open</span>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-gray-500">
              {activeTab ? 'Tente ajustar os filtros ou adicione novos arquivos.' : 'Selecione uma aba para ver os arquivos.'}
            </p>
          </div>
        ) : null}
      </div>

      {/* Input oculto para upload de arquivo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileReplace}
        className="hidden"
      />

      {/* Modal de Adicionar Bucket */}
      {showBucketModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Adicionar Novo Bucket</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Bucket</label>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="nome-do-bucket"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={newBucketLabel}
                  onChange={(e) => setNewBucketLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome amigável do bucket"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  value={newBucketCategory}
                  onChange={(e) => setNewBucketCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="categoria-unica"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newBucketDescription}
                  onChange={(e) => setNewBucketDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição do bucket"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowBucketModal(false)
                    setNewBucketName('')
                    setNewBucketLabel('')
                    setNewBucketCategory('')
                    setNewBucketDescription('')
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={addNewBucket}
                  disabled={loading || !newBucketName || !newBucketLabel || !newBucketCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criar Referência */}
      {showCreateRefModal && selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
            onClick={() => {
              setShowCreateRefModal(false)
              setRefDescription('')
              setRefTags('')
              setSelectedItem(null)
            }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-modalSlideIn border border-gray-200">
            
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white px-8 py-6">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">📚 Criar Referência no Banco</h2>
                  <p className="text-blue-100 text-sm">Vincular arquivo: <strong>{selectedItem.name}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateRefModal(false)
                    setRefDescription('')
                    setRefTags('')
                    setSelectedItem(null)
                  }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
                  aria-label="Fechar modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
              <div className="p-8 space-y-6">
                
                {/* File Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-600 mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2">folder</span>
                    Informações do Arquivo
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Nome:</span>
                      <p className="text-gray-600 font-semibold truncate">{selectedItem.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Tipo:</span>
                      <p className="text-gray-600 font-semibold">{selectedItem.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Tamanho:</span>
                      <p className="text-gray-600 font-semibold">{selectedItem.size}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Bucket:</span>
                      <p className="text-gray-600 font-semibold">{selectedItem.bucket}</p>
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">description</span>
                    Descrição
                  </h3>
                  <textarea
                    value={refDescription}
                    onChange={(e) => setRefDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Descreva o conteúdo do arquivo..."
                  />
                </div>

                {/* Tags Card */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h3 className="text-sm font-bold text-purple-600 mb-4 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">label</span>
                    Tags (separadas por vírgula)
                  </h3>
                  <input
                    type="text"
                    value={refTags}
                    onChange={(e) => setRefTags(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="educação, literatura, matemática..."
                  />
                  <p className="text-purple-600 text-xs mt-2">💡 Use vírgulas para separar as tags</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateRefModal(false)
                      setRefDescription('')
                      setRefTags('')
                      setSelectedItem(null)
                    }}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateReference}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">save</span>
                    {loading ? 'Criando...' : 'Criar Referência'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes modalSlideIn {
              from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
              }
              to {
                opacity: 1;
                transform: scale(1) translateY(0);
              }
            }

            .animate-fadeIn {
              animation: fadeIn 0.3s ease-out forwards;
            }

            .animate-modalSlideIn {
              animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
          `}</style>
        </div>
      )}

      {/* Modal de Renomear */}
      {showRenameModal && selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
            onClick={() => {
              setShowRenameModal(false)
              setNewName('')
              setSelectedItem(null)
            }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-modalSlideIn border border-gray-200">
            
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white px-8 py-6">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">✏️ Renomear Arquivo</h2>
                  <p className="text-yellow-100 text-sm">Arquivo atual: <strong>{selectedItem.name}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setShowRenameModal(false)
                    setNewName('')
                    setSelectedItem(null)
                  }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
                  aria-label="Fechar modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
              <div className="p-8 space-y-6">
                
                {/* Current File Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-600 mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2">info</span>
                    Informações Atuais
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 text-2xl">
                        {selectedItem.type === 'PDF' ? 'picture_as_pdf' : 
                         selectedItem.type === 'DOCX' ? 'description' :
                         selectedItem.type === 'PPTX' ? 'slideshow' :
                         selectedItem.type === 'EPUB' ? 'book' :
                         selectedItem.type === 'MP4' ? 'video_file' :
                         selectedItem.type === 'MP3' ? 'audio_file' :
                         'folder_zip'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-600">{selectedItem.name}</h5>
                      <p className="text-gray-600 text-sm">{selectedItem.type} • {selectedItem.size}</p>
                      <p className="text-gray-500 text-xs">Bucket: {selectedItem.bucket}</p>
                    </div>
                  </div>
                </div>

                {/* New Name Input Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
                  <h3 className="text-sm font-bold text-yellow-600 mb-4 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">drive_file_rename_outline</span>
                    Novo Nome do Arquivo
                  </h3>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-yellow-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    placeholder="Digite o novo nome do arquivo..."
                    autoFocus
                  />
                  <p className="text-yellow-600 text-xs mt-2">💡 Mantenha a extensão original para preservar o tipo do arquivo</p>
                </div>

                {/* Preview Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">preview</span>
                    Visualização
                  </h3>
                  <div className="bg-white p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <span className="material-symbols-outlined text-gray-400">arrow_forward</span>
                      <div>
                        <p className="text-sm text-gray-600">Nome anterior:</p>
                        <p className="font-medium text-gray-600">{selectedItem.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-4">
                      <span className="material-symbols-outlined text-green-600">check</span>
                      <div>
                        <p className="text-sm text-gray-600">Novo nome:</p>
                        <p className="font-medium text-gray-600">{newName || 'Digite o novo nome...'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-600 mb-3 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">warning</span>
                    Importante
                  </h3>
                  <ul className="text-amber-700 text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="material-symbols-outlined text-xs mr-2 mt-0.5">info</span>
                      Esta ação alterará o nome do arquivo no sistema
                    </li>
                    <li className="flex items-start">
                      <span className="material-symbols-outlined text-xs mr-2 mt-0.5">link</span>
                      Links existentes podem ser afetados
                    </li>
                    <li className="flex items-start">
                      <span className="material-symbols-outlined text-xs mr-2 mt-0.5">backup</span>
                      Certifique-se de que o nome seja único no bucket
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowRenameModal(false)
                      setNewName('')
                      setSelectedItem(null)
                    }}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRename}
                    disabled={loading || !newName.trim() || newName === selectedItem.name}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">drive_file_rename_outline</span>
                    {loading ? 'Renomeando...' : 'Renomear Arquivo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mover/Copiar */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Mover/Copiar Arquivo</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ação</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="copy"
                      checked={moveAction === 'copy'}
                      onChange={(e) => setMoveAction(e.target.value as 'copy' | 'move')}
                      className="mr-2"
                    />
                    Copiar
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="move"
                      checked={moveAction === 'move'}
                      onChange={(e) => setMoveAction(e.target.value as 'copy' | 'move')}
                      className="mr-2"
                    />
                    Mover
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bucket de Destino</label>
                <select
                  value={targetBucket}
                  onChange={(e) => setTargetBucket(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o bucket</option>
                  {availableBuckets.filter(bucket => bucket.name !== selectedItem?.bucket).map(bucket => (
                    <option key={bucket.name} value={bucket.name}>{bucket.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowMoveModal(false)
                    setTargetBucket('')
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleMove}
                  disabled={!targetBucket || loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processando...' : (moveAction === 'copy' ? 'Copiar' : 'Mover')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Deletar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <span className="material-symbols-outlined text-red-600">warning</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 text-center mb-2">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Tem certeza que deseja deletar o arquivo <strong>{selectedItem?.name}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                >
                  {loading ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vincular à Coleção */}
      {showLinkCollectionModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Vincular à Coleção</h3>
              <p className="text-sm text-gray-600 mb-4">
                Arquivo: <strong>{selectedItem.name}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Coleção</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma coleção</option>
                  <option value="literatura-brasileira">Literatura Brasileira</option>
                  <option value="literatura-mundial">Literatura Mundial</option>
                  <option value="ciencias">Ciências</option>
                  <option value="matematica">Matemática</option>
                  <option value="historia">História</option>
                  <option value="geografia">Geografia</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowLinkCollectionModal(false)
                    setSelectedCollection('')
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLinkToCollection}
                  disabled={loading || !selectedCollection}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Vinculando...' : 'Vincular'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar à Biblioteca */}
      {showAddLibraryModal && selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with enhanced blur */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fadeIn"
            onClick={() => {
              setShowAddLibraryModal(false)
              setLibraryCategory('')
              setSelectedItem(null)
            }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden animate-modalSlideIn border border-gray-200">
            
            {/* Header with gradient */}
            <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white px-8 py-6">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex justify-between items-start">
                <div className="flex-1 pr-4">
                  <h2 className="text-2xl font-bold mb-2 leading-tight">📚 Adicionar à Biblioteca</h2>
                  <p className="text-green-100 text-sm">Arquivo: <strong>{selectedItem.name}</strong></p>
                </div>
                <button
                  onClick={() => {
                    setShowAddLibraryModal(false)
                    setLibraryCategory('')
                    setSelectedItem(null)
                  }}
                  className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
                  aria-label="Fechar modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
              <div className="p-8 space-y-6">
                
                {/* File Preview Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-600 mb-4 flex items-center">
                    <span className="material-symbols-outlined mr-2">preview</span>
                    Preview do Arquivo
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600 text-2xl">
                        {selectedItem.type === 'PDF' ? 'picture_as_pdf' : 
                         selectedItem.type === 'DOCX' ? 'description' :
                         selectedItem.type === 'PPTX' ? 'slideshow' :
                         selectedItem.type === 'EPUB' ? 'book' :
                         selectedItem.type === 'MP4' ? 'video_file' :
                         selectedItem.type === 'MP3' ? 'audio_file' :
                         'folder_zip'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-600 truncate">{selectedItem.name}</h5>
                      <p className="text-gray-600 text-sm">{selectedItem.type} • {selectedItem.size}</p>
                    </div>
                  </div>
                </div>

                {/* Book Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-600 mb-3 uppercase tracking-wider flex items-center">
                      <span className="material-symbols-outlined mr-2">title</span>
                      Título do Livro
                    </h3>
                    <input
                      type="text"
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite o título do livro..."
                      required
                    />
                  </div>

                  {/* Author Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <h3 className="text-sm font-bold text-purple-600 mb-3 uppercase tracking-wider flex items-center">
                      <span className="material-symbols-outlined mr-2">person</span>
                      Autor
                    </h3>
                    <input
                      type="text"
                      value={bookAuthor}
                      onChange={(e) => setBookAuthor(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Nome do autor..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Publisher Card */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <h3 className="text-sm font-bold text-orange-600 mb-3 uppercase tracking-wider flex items-center">
                      <span className="material-symbols-outlined mr-2">business</span>
                      Editora
                    </h3>
                    <input
                      type="text"
                      value={bookPublisher}
                      onChange={(e) => setBookPublisher(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Nome da editora..."
                    />
                  </div>

                  {/* Format Info Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider flex items-center">
                      <span className="material-symbols-outlined mr-2">description</span>
                      Formato
                    </h3>
                    <div className="flex items-center space-x-2 py-3">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-xl ${
                        selectedItem.type === 'PDF' ? 'bg-red-100 text-red-600' : 
                        selectedItem.type === 'EPUB' ? 'bg-green-100 text-green-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {selectedItem.type}
                      </span>
                      <span className="text-gray-600 text-sm">• {selectedItem.size}</span>
                    </div>
                  </div>
                </div>

                {/* Description Card */}
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 border border-teal-100">
                  <h3 className="text-sm font-bold text-teal-600 mb-3 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">subject</span>
                    Descrição/Sinopse
                  </h3>
                  <textarea
                    value={bookDescription}
                    onChange={(e) => setBookDescription(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Descrição do livro, sinopse ou resumo..."
                  />
                </div>

                {/* Category Selection Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <h3 className="text-sm font-bold text-green-600 mb-4 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">category</span>
                    Categoria da Biblioteca
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'literario', label: '📖 Literário', desc: 'Obras literárias' },
                      { value: 'professor', label: '👨‍🏫 Professor', desc: 'Material docente' },
                      { value: 'aluno', label: '🎓 Aluno', desc: 'Conteúdo estudantil' },
                      { value: 'geral', label: '📚 Geral', desc: 'Acervo geral' }
                    ].map((category) => (
                      <label
                        key={category.value}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                          libraryCategory === category.value
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-200 bg-white hover:border-green-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="libraryCategory"
                          value={category.value}
                          checked={libraryCategory === category.value}
                          onChange={(e) => setLibraryCategory(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-600 text-sm">{category.label}</div>
                          <div className="text-gray-600 text-xs">{category.desc}</div>
                        </div>
                        {libraryCategory === category.value && (
                          <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="text-sm font-bold text-amber-600 mb-3 uppercase tracking-wider flex items-center">
                    <span className="material-symbols-outlined mr-2">info</span>
                    Sobre a Biblioteca de Livros
                  </h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    📚 O arquivo será adicionado ao Portal de Livros e ficará disponível para leitura pelos usuários. 
                    As informações do livro podem ser editadas posteriormente.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => {
                      setShowAddLibraryModal(false)
                      setLibraryCategory('')
                      setBookTitle('')
                      setBookAuthor('')
                      setBookPublisher('')
                      setBookDescription('')
                      setSelectedItem(null)
                    }}
                    className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddToLibrary}
                    disabled={loading || !libraryCategory || !bookTitle.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined">library_add</span>
                    {loading ? 'Adicionando...' : 'Adicionar ao Portal de Livros'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Desvincular */}
      {showUnlinkModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
                <span className="material-symbols-outlined text-orange-600">link_off</span>
              </div>
              <h3 className="text-lg font-medium text-gray-700 text-center mb-2">Desvincular Arquivo</h3>
              <p className="text-sm text-gray-500 text-center mb-4">
                Tem certeza que deseja desvincular o arquivo <strong>{selectedItem?.name}</strong> do conteúdo? 
                O arquivo permanecerá no bucket S3, mas será removido da biblioteca/coleção.
              </p>
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => {
                    setShowUnlinkModal(false)
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUnlinkFromContent}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                >
                  {loading ? 'Desvinculando...' : 'Desvincular'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
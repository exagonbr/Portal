'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
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

const ITEMS_PER_PAGE = 20

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

  // Carregar buckets ao montar o componente
  useEffect(() => {
    loadBuckets()
  }, [])

  // Carregar arquivos quando mudar aba ativa
  useEffect(() => {
    if (activeTab) {
      loadFiles()
    }
  }, [activeTab])

  // Reset página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, contentType, sortBy, activeTab])

  const loadBuckets = async () => {
    setBucketsLoading(true)
    setError(null)
    try {
      const buckets = await BucketService.getConfiguredBuckets()
      setAvailableBuckets(buckets)
      
      // Definir primeira aba como ativa se não houver nenhuma
      if (buckets.length > 0 && !activeTab) {
        setActiveTab(buckets[0].category)
      }
      
      // Inicializar estado de contents para todos os buckets
      const initialContents: Record<string, S3FileInfo[]> = {}
      buckets.forEach(bucket => {
        initialContents[bucket.category] = []
      })
      setContents(initialContents)
      
    } catch (err) {
      console.error('Erro ao carregar buckets:', err)
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
      
      // Buscar TODOS os arquivos do bucket (não apenas os vinculados)
      const allBucketFiles = await FileService.getAllBucketFiles(activeTab)
      updateProgress(60)
      
      // Verificar referências no banco de dados
      const filesWithReferences = await FileService.checkDatabaseReferences(activeTab as 'literario' | 'professor' | 'aluno')
      updateProgress(80)
      
      // Combinar arquivos do bucket com informações de referência
      const combinedFiles = allBucketFiles.map((bucketFile: S3FileInfo) => {
        const dbReference = filesWithReferences.find(dbFile => dbFile.name === bucketFile.name)
        return {
          ...bucketFile,
          hasDbReference: !!dbReference,
          dbRecord: dbReference?.dbRecord || null
        }
      })
      
      updateProgress(100)
      
      setContents(prev => ({
        ...prev,
        [activeTab]: combinedFiles
      }))
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err)
      setError('Erro ao carregar arquivos. Tente novamente.')
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
        
        const allBucketFiles = await FileService.getAllBucketFiles(bucket.category)
        const filesWithReferences = await FileService.checkDatabaseReferences(bucket.category as 'literario' | 'professor' | 'aluno')
        
        const combinedFiles = allBucketFiles.map((bucketFile: S3FileInfo) => {
          const dbReference = filesWithReferences.find(dbFile => dbFile.name === bucketFile.name)
          return {
            ...bucketFile,
            hasDbReference: !!dbReference,
            dbRecord: dbReference?.dbRecord || null
          }
        })
        
        allFiles[bucket.category] = combinedFiles
      }
      
      setContents(allFiles)
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err)
      setError('Erro ao carregar arquivos. Tente novamente.')
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
      console.error('Erro ao adicionar bucket:', err)
      setError('Erro ao adicionar bucket. Verifique se o bucket existe na AWS.')
    } finally {
      setLoading(false)
    }
  }

  // Função para filtrar e ordenar conteúdo com paginação
  const getFilteredContent = () => {
    let content = contents[activeTab] || []
    
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
    
    // Calcular total de páginas
    const totalItems = content.length
    const pages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    setTotalPages(pages)
    
    // Aplicar paginação
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    
    return content.slice(startIndex, endIndex)
  }

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
        console.error('Erro ao substituir arquivo:', error)
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
        console.error('Erro ao renomear arquivo:', error)
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
        console.error('Erro ao mover arquivo:', error)
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
        console.error('Erro ao deletar arquivo:', error)
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
        console.error('Erro ao criar referência:', error)
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
        console.error('Erro ao vincular à coleção:', error)
        setError('Erro ao vincular arquivo à coleção')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleAddToLibrary = async () => {
    if (selectedItem && libraryCategory) {
      try {
        setLoading(true)
        await FileService.addToLibrary(selectedItem.id, libraryCategory)
        await loadFiles()
        setShowAddLibraryModal(false)
        setLibraryCategory('')
        setSelectedItem(null)
      } catch (error) {
        console.error('Erro ao adicionar à biblioteca:', error)
        setError('Erro ao adicionar arquivo à biblioteca')
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
    setShowAddLibraryModal(true)
  }

  const filteredContent = getFilteredContent()

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerenciamento de Conteúdo</h1>
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
          <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
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
              {availableBuckets.map((bucket) => (
                <button
                  key={bucket.category}
                  onClick={() => setActiveTab(bucket.category)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                    activeTab === bucket.category
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {bucket.category === 'literario' ? 'book' : 
                     bucket.category === 'professor' ? 'school' : 'person'}
                  </span>
                  <span>{bucket.label}</span>
                  {contents[bucket.category] && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                      {contents[bucket.category].length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {activeTab && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-blue-600 mr-2">folder</span>
              <div>
                <p className="text-sm text-gray-600">Total de Arquivos</p>
                <p className="text-xl font-semibold">{filteredContent.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-green-600 mr-2">check_circle</span>
              <div>
                <p className="text-sm text-gray-600">Com Referência DB</p>
                <p className="text-xl font-semibold text-green-600">
                  {filteredContent.filter(item => item.hasDbReference).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-red-600 mr-2">warning</span>
              <div>
                <p className="text-sm text-gray-600">Sem Referência DB</p>
                <p className="text-xl font-semibold text-red-600">
                  {filteredContent.filter(item => !item.hasDbReference).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Conteúdo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arquivo
                </th>
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
              {filteredContent.map((item) => (
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
                        <div className="text-sm font-medium text-gray-900 flex items-center">
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(item.lastModified).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.hasDbReference ? (
                      <div className="flex items-center text-green-600">
                        <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                        <span className="text-xs">Vinculado</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="flex items-center text-red-600 mr-2">
                          <span className="material-symbols-outlined text-sm mr-1">error</span>
                          <span className="text-xs">Não vinculado</span>
                        </div>
                        <button
                          onClick={() => openCreateRefModal(item)}
                          className="text-blue-600 hover:text-blue-800 text-xs underline mr-2"
                          title="Criar referência no banco"
                        >
                          Criar
                        </button>
                        <button
                          onClick={() => openLinkCollectionModal(item)}
                          className="text-green-600 hover:text-green-800 text-xs underline mr-2"
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
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleView(item)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Visualizar"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      {item.hasDbReference && (
                        <>
                          <button
                            onClick={() => handleReplace(item)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Substituir arquivo"
                          >
                            <span className="material-symbols-outlined text-sm">file_upload</span>
                          </button>
                          <button
                            onClick={() => openRenameModal(item)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="Renomear"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button
                            onClick={() => openMoveModal(item)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                            title="Mover/Copiar"
                          >
                            <span className="material-symbols-outlined text-sm">drive_file_move</span>
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Deletar"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando{' '}
                  <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>
                  {' '}até{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, (contents[activeTab] || []).length)}
                  </span>
                  {' '}de{' '}
                  <span className="font-medium">{(contents[activeTab] || []).length}</span>
                  {' '}resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                  </button>
                  
                  {/* Páginas */}
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
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Próxima</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando arquivos...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">folder_open</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Novo Bucket</h3>
              
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Referência no Banco</h3>
              <p className="text-sm text-gray-600 mb-4">
                Arquivo: <strong>{selectedItem.name}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={refDescription}
                  onChange={(e) => setRefDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição do arquivo"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={refTags}
                  onChange={(e) => setRefTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowCreateRefModal(false)
                    setRefDescription('')
                    setRefTags('')
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateReference}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Criando...' : 'Criar Referência'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Renomear */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Renomear Arquivo</h3>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Novo nome do arquivo"
              />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowRenameModal(false)
                    setNewName('')
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRename}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Renomeando...' : 'Renomear'}
                </button>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mover/Copiar Arquivo</h3>
              
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
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Confirmar Exclusão</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vincular à Coleção</h3>
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar à Biblioteca</h3>
              <p className="text-sm text-gray-600 mb-4">
                Arquivo: <strong>{selectedItem.name}</strong>
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria da Biblioteca</label>
                <select
                  value={libraryCategory}
                  onChange={(e) => setLibraryCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="literario">Literário</option>
                  <option value="professor">Professor</option>
                  <option value="aluno">Aluno</option>
                  <option value="geral">Geral</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddLibraryModal(false)
                    setLibraryCategory('')
                    setSelectedItem(null)
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddToLibrary}
                  disabled={loading || !libraryCategory}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
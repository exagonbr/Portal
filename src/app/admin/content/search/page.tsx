'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'
import { FileService } from '@/services/fileService'
import { S3FileInfo } from '@/types/files'

// Mock data para diferentes tipos de conteúdo
const MOCK_CONTENT = {
  literario: [
    {
      id: 'lit_1',
      name: 'Dom Casmurro.pdf',
      type: 'PDF',
      size: '2.4 MB',
      bucket: 'literario-bucket',
      lastModified: '2024-01-15',
      description: 'Clássico da literatura brasileira',
      url: 'https://literario-bucket.s3.amazonaws.com/dom-casmurro.pdf'
    },
    {
      id: 'lit_2',
      name: 'Vidas Secas.epub',
      type: 'EPUB',
      size: '1.8 MB',
      bucket: 'literario-bucket',
      lastModified: '2024-02-10',
      description: 'Romance regionalista de Graciliano Ramos',
      url: 'https://literario-bucket.s3.amazonaws.com/vidas-secas.epub'
    }
  ],
  professor: [
    {
      id: 'prof_1',
      name: 'Plano de Aula - Matemática.docx',
      type: 'DOCX',
      size: '856 KB',
      bucket: 'professor-bucket',
      lastModified: '2024-03-05',
      description: 'Plano de aula para ensino fundamental',
      url: 'https://professor-bucket.s3.amazonaws.com/plano-matematica.docx'
    },
    {
      id: 'prof_2',
      name: 'Apresentação História.pptx',
      type: 'PPTX',
      size: '15.2 MB',
      bucket: 'professor-bucket',
      lastModified: '2024-02-28',
      description: 'Slides sobre história do Brasil',
      url: 'https://professor-bucket.s3.amazonaws.com/apresentacao-historia.pptx'
    }
  ],
  aluno: [
    {
      id: 'alun_1',
      name: 'Exercícios Matemática 6º Ano.pdf',
      type: 'PDF',
      size: '3.2 MB',
      bucket: 'aluno-bucket',
      lastModified: '2024-03-10',
      description: 'Lista de exercícios para estudantes',
      url: 'https://aluno-bucket.s3.amazonaws.com/exercicios-mat-6ano.pdf'
    },
    {
      id: 'alun_2',
      name: 'Jogo Educativo.zip',
      type: 'ZIP',
      size: '45.8 MB',
      bucket: 'aluno-bucket',
      lastModified: '2024-01-20',
      description: 'Jogo interativo de ciências',
      url: 'https://aluno-bucket.s3.amazonaws.com/jogo-educativo.zip'
    }
  ]
}

const CONTENT_TYPES = ['Todos', 'PDF', 'DOCX', 'PPTX', 'EPUB', 'ZIP', 'MP4', 'MP3']
const SORT_OPTIONS = [
  { value: 'name', label: 'Nome' },
  { value: 'date', label: 'Data de Modificação' },
  { value: 'size', label: 'Tamanho' },
  { value: 'type', label: 'Tipo' }
]

const BUCKETS = [
  { value: 'literario-bucket', label: 'Conteúdo Literário' },
  { value: 'professor-bucket', label: 'Conteúdo Professor' },
  { value: 'aluno-bucket', label: 'Conteúdo Aluno' }
]

export default function AdminContentSearchPage() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [contentType, setContentType] = useState('Todos')
  const [sortBy, setSortBy] = useState('name')
  
  // Estados para abas e conteúdo
  const [activeTab, setActiveTab] = useState('literario')
  const [contents, setContents] = useState<Record<string, S3FileInfo[]>>({
    literario: [],
    professor: [],
    aluno: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para modais e ações
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCreateRefModal, setShowCreateRefModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<S3FileInfo | null>(null)
  const [newName, setNewName] = useState('')
  const [targetBucket, setTargetBucket] = useState('')
  const [moveAction, setMoveAction] = useState<'copy' | 'move'>('copy')
  const [refDescription, setRefDescription] = useState('')
  const [refTags, setRefTags] = useState('')

  const tabs = [
    { id: 'literario', label: 'Conteúdo Literário', icon: 'book' },
    { id: 'professor', label: 'Conteúdo Professor', icon: 'school' },
    { id: 'aluno', label: 'Conteúdo Aluno', icon: 'person' }
  ]

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      // Carregar arquivos de todas as categorias com verificação de referências
      const allFiles: Record<string, S3FileInfo[]> = {}
      
      for (const tab of tabs) {
        const files = await FileService.checkDatabaseReferences(tab.id as 'literario' | 'professor' | 'aluno')
        allFiles[tab.id] = files
      }
      
      setContents(allFiles)
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err)
      setError('Erro ao carregar arquivos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Função para filtrar e ordenar conteúdo
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
    
    return content
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

  const filteredContent = getFilteredContent()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerenciamento de Conteúdo</h1>
        <p className="text-gray-600">Gerencie arquivos nos buckets S3 da AWS e suas referências no banco de dados</p>
      </div>

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
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                <span>{tab.label}</span>
                {contents[tab.id] && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {contents[tab.id].length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Estatísticas */}
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
                          className="text-blue-600 hover:text-blue-800 text-xs underline"
                          title="Criar referência no banco"
                        >
                          Criar
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando arquivos...</p>
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-400 text-6xl mb-4">folder_open</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros ou adicione novos arquivos.</p>
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
                  {BUCKETS.filter(bucket => bucket.value !== selectedItem?.bucket).map(bucket => (
                    <option key={bucket.value} value={bucket.value}>{bucket.label}</option>
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
    </div>
  )
}
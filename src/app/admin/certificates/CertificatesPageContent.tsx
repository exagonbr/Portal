'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { certificateService } from '@/services/certificateService'
import { CertificateDto, CertificateStats, CertificateFilter } from '@/types/certificate'
import { useToast } from '@/components/ToastManager'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import { 
  Award, 
  Search, 
  Edit, 
  Eye, 
  RefreshCw, 
  Download,
  Users,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ExternalLink,
  Filter,
  X
} from 'lucide-react'

export default function CertificatesPageContent() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [certificates, setCertificates] = useState<CertificateDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRecreate, setFilterRecreate] = useState<boolean | null>(null)
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    recreatable: 0,
    programs: 0,
    usersWithCerts: 0
  })

  const fetchCertificates = async (page = 1, search = '', recreateFilter: boolean | null = null, showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const filter: CertificateFilter = {
        page,
        limit: itemsPerPage,
        ...(search && { search }),
        ...(recreateFilter !== null && { recreate: recreateFilter })
      };
      
      const response = await certificateService.getCertificates(filter);

      if (response.success && response.data) {
        setCertificates(response.data.items)
        setTotalItems(response.data.total)
        setCurrentPage(page)
      } else {
        // Verificar se é um erro de autenticação
        if (response.message?.includes('Sessão expirada') || response.message?.includes('não autenticado')) {
          showError("Sessão expirada. Por favor, faça login novamente.")
          setTimeout(() => {
            router.push('/auth/login?auth_error=expired')
          }, 1000)
          return;
        }
        
        throw new Error(response.message || 'Erro ao carregar certificados');
      }

      // Buscar estatísticas apenas se não estiver fazendo refresh
      if (showLoadingIndicator || page === 1) {
        await fetchStats()
      }

      if (!showLoadingIndicator) {
        showSuccess("Lista de certificados atualizada com sucesso!")
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar certificados:', error)
      showError("Não foi possível carregar a lista de certificados.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsResponse = await certificateService.getStats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      // Não mostrar erro para stats, pois é menos crítico
    }
  }

  useEffect(() => {
    fetchCertificates(currentPage, searchQuery, filterRecreate)
  }, [currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCertificates(1, searchQuery, filterRecreate)
  }

  const handleRefresh = () => {
    fetchCertificates(currentPage, searchQuery, filterRecreate, false)
  }

  const handleFilterChange = (recreate: boolean | null) => {
    setFilterRecreate(recreate)
    setCurrentPage(1)
    fetchCertificates(1, searchQuery, recreate)
  }

  const handleViewCertificate = (certificate: CertificateDto) => {
    if (certificate.path) {
      window.open(certificate.path, '_blank')
    } else {
      showError('Caminho do certificado não disponível')
    }
  }

  const handleDownloadCertificate = async (certificate: CertificateDto) => {
    try {
      if (!certificate.path) {
        showError('Caminho do certificado não disponível')
        return
      }

      // Criar um link temporário para download
      const link = document.createElement('a')
      link.href = certificate.path
      link.download = `certificado-${certificate.license_code || certificate.document || 'download'}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showSuccess('Download iniciado!')
    } catch (error) {
      console.error('Erro no download:', error)
      showError('Erro ao baixar certificado')
    }
  }

  const handleDeleteCertificate = async (certificate: CertificateDto) => {
    if (!confirm(`Tem certeza que deseja excluir o certificado ${certificate.license_code || certificate.document}?`)) {
      return
    }

    try {
      await certificateService.deleteCertificate(Number(certificate.id))
      showSuccess('Certificado excluído com sucesso!')
      
      // Recarregar lista na página atual ou voltar uma página se não houver mais items
      const newTotal = totalItems - 1
      const maxPage = Math.ceil(newTotal / itemsPerPage)
      const pageToLoad = currentPage > maxPage ? Math.max(1, maxPage) : currentPage
      
      fetchCertificates(pageToLoad, searchQuery, filterRecreate)
    } catch (error) {
      console.error('Erro ao excluir certificado:', error)
      showError('Erro ao excluir certificado')
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'Data inválida'
    }
  }

  const formatScore = (score?: number) => {
    if (typeof score !== 'number') return 'N/A'
    return `${score}%`
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const hasFilters = searchQuery || filterRecreate !== null

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Certificados</h1>
              <p className="text-gray-600 mt-1">Gerencie os certificados emitidos no sistema</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                disabled={refreshing || loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Award}
              title="Total"
              value={stats.totalCertificates}
              subtitle="Certificados"
              color="blue"
            />
            <StatCard
              icon={Users}
              title="Usuários"
              value={stats.usersWithCerts}
              subtitle="Com Certificados"
              color="green"
            />
            <StatCard
              icon={FileText}
              title="Programas"
              value={stats.programs}
              subtitle="Diferentes"
              color="purple"
            />
            <StatCard
              icon={RefreshCw}
              title="Recriáveis"
              value={stats.recreatable}
              subtitle="Certificados"
              color="amber"
            />
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por código de licença, documento ou programa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={loading}>
                Buscar
              </Button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filtros:</span>
              </div>
              
              <button
                onClick={() => handleFilterChange(null)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filterRecreate === null 
                    ? 'bg-blue-100 border-blue-300 text-blue-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              
              <button
                onClick={() => handleFilterChange(true)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filterRecreate === true 
                    ? 'bg-green-100 border-green-300 text-green-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Recriáveis
              </button>
              
              <button
                onClick={() => handleFilterChange(false)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filterRecreate === false 
                    ? 'bg-orange-100 border-orange-300 text-orange-700' 
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Não Recriáveis
              </button>

              {hasFilters && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setFilterRecreate(null)
                    setCurrentPage(1)
                    fetchCertificates(1, '', null)
                  }}
                  className="px-2 py-1 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando certificados...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {hasFilters ? 'Nenhum certificado encontrado' : 'Nenhum certificado disponível'}
              </p>
              <p className="text-gray-400 text-sm">
                {hasFilters 
                  ? "Tente ajustar os filtros ou busca" 
                  : "Os certificados aparecerão aqui quando forem emitidos"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Certificado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuário
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Programa/Série
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data Emissão
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {certificates.map((certificate) => (
                      <tr key={certificate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {certificate.license_code || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {certificate.document || 'Sem documento'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {certificate.user_id || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {certificate.tv_show_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ⭐ {formatScore(certificate.score)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            certificate.recreate 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {certificate.recreate ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Recriável
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Final
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(certificate.created_at)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleViewCertificate(certificate)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Visualizar certificado"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadCertificate(certificate)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Baixar certificado"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {certificate.path && (
                              <a
                                href={certificate.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                title="Abrir em nova aba"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDeleteCertificate(certificate)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Excluir certificado"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="space-y-4 p-4">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Award className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {certificate.license_code || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {certificate.document || 'Sem documento'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ⭐ {formatScore(certificate.score)}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              certificate.recreate 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {certificate.recreate ? (
                                <RefreshCw className="w-3 h-3" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Usuário: </span>
                            {certificate.user_id || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Programa: </span>
                            {certificate.tv_show_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Data: </span>
                            {formatDate(certificate.created_at)}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCertificate(certificate)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadCertificate(certificate)}
                            className="flex items-center gap-1"
                          >
                            <Download className="w-4 h-4" />
                            Baixar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCertificate(certificate)}
                            className="flex items-center gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Pagination numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else {
                      if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 text-sm rounded ${
                          pageNum === currentPage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage >= totalPages || loading}
                  className="flex items-center gap-1"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
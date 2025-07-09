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
  Trash2, 
  Eye, 
  RefreshCw, 
  Download,
  Users,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'

export default function ManageCertificates() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [certificates, setCertificates] = useState<CertificateDto[]>([])
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    recreatable: 0,
    programs: 0,
    usersWithCerts: 0
  })

  const fetchCertificates = async (page = 1, search = '', showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const filter: CertificateFilter = {
        page,
        limit: itemsPerPage,
        search
      };
      
      const response = await certificateService.getCertificates(filter);

      if (response.success && response.data) {
        setCertificates(response.data.items)
        setTotalItems(response.data.total)
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

      // Fetch stats
      const statsResponse = await certificateService.getStats()
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data)
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

  useEffect(() => {
    const loadCertificates = async () => {
      await fetchCertificates(currentPage, searchQuery)
    }
    loadCertificates()
  }, [currentPage, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchCertificates(1, searchQuery)
  }

  const handleRefresh = () => {
    fetchCertificates(currentPage, searchQuery, false)
  }

  const handleDeleteCertificate = async (certificate: CertificateDto) => {
    if (!confirm(`Tem certeza que deseja excluir o certificado ${certificate.license_code}?`)) {
      return
    }

    try {
      setLoading(true)
      await certificateService.deleteCertificate(Number(certificate.id))
      showSuccess("O certificado foi excluído com sucesso.")
      
      // Recarregar a lista
      await fetchCertificates(currentPage, searchQuery, false)
    } catch (error: any) {
      console.error('❌ Erro ao excluir certificado:', error)
      
      // Verificar se é um erro de autenticação
      if (error.message?.includes('Sessão expirada') || error.message?.includes('não autenticado')) {
        showError("Sessão expirada. Por favor, faça login novamente.")
        setTimeout(() => {
          router.push('/auth/login?auth_error=expired')
        }, 1000)
        return;
      }
      
      showError("Não foi possível excluir o certificado.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewCertificate = (certificate: CertificateDto) => {
    // Abrir o certificado em uma nova aba
    window.open(certificate.path, '_blank')
  }

  const handleDownloadCertificate = (certificate: CertificateDto) => {
    // Iniciar download do certificado
    const link = document.createElement('a')
    link.href = certificate.path || '#'
    link.download = `certificate-${certificate.license_code || 'download'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

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
                disabled={refreshing}
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

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar certificado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
        </div>

        {/* Content */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Nenhum certificado encontrado</p>
              <p className="text-gray-400 text-sm">Os certificados aparecerão aqui quando forem emitidos</p>
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
                        Curso/Série
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
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
                                {certificate.license_code}
                              </div>
                              <div className="text-xs text-gray-500">
                                {certificate.document}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {certificate.user_id}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {certificate.tv_show_name}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {certificate.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-center text-gray-500">
                          {new Date(certificate.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewCertificate(certificate)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadCertificate(certificate)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCertificate(certificate)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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
                                {certificate.license_code}
                              </div>
                              <div className="text-xs text-gray-500">
                                {certificate.document}
                              </div>
                            </div>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {certificate.score}%
                          </span>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Curso: </span>
                            {certificate.tv_show_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Data: </span>
                            {new Date(certificate.created_at).toLocaleDateString()}
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
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-700">
                  {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
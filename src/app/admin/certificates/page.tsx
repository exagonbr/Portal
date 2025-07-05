'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ToastManager'
import { certificateService } from '@/services/certificateService.mock'
import { userService } from '@/services/userService.mock'
import { CertificateResponseDto, BaseFilterDto } from '@/types/api'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StandardCard'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Award,
  RefreshCw,
  Filter,
  X,
  Calendar,
  User,
  Users,
  BookOpen,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

// Interface para estatísticas de certificados
interface CertificateStats {
  totalCertificates: number
  recreatable: number
  programs: number
  usersWithCerts: number
}

export default function AdminCertificatesPage() {
  const { showSuccess, showError } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Dados principais
  const [certificates, setCertificates] = useState<CertificateResponseDto[]>([])
  const [users, setUsers] = useState<any[]>([])

  // Paginação e Filtros
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [searchQuery, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<BaseFilterDto & { recreate?: boolean, tv_show_name?: string }>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)

  // Modais (simplificado por enquanto)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateResponseDto | null>(null)

  // Estatísticas
  const [stats, setStats] = useState<CertificateStats>({
    totalCertificates: 0,
    recreatable: 0,
    programs: 0,
    usersWithCerts: 0,
  })

  const calculateStats = useCallback((allCertificates: CertificateResponseDto[]) => {
    const totalCertificates = allCertificates.length
    const recreatable = allCertificates.filter(c => c.recreate).length
    const programs = new Set(allCertificates.map(c => c.tv_show_name)).size
    const usersWithCerts = new Set(allCertificates.map(c => c.user_id)).size

    setStats({ totalCertificates, recreatable, programs, usersWithCerts })
  }, [])

  const fetchPageData = useCallback(async (page = 1, search = '', currentFilters: typeof filters = {}, showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true)
    else setRefreshing(true)

    await new Promise(resolve => setTimeout(resolve, 500))

    try {
      const params = {
        page,
        limit: itemsPerPage,
        search,
        ...currentFilters,
      }

      const [certResponse, usersResponse] = await Promise.all([
        certificateService.getCertificates(params),
        userService.getUsers({ limit: 1000 }) // Assumindo que userService está disponível
      ]);

      setCertificates(certResponse.items || [])
      setTotalItems(certResponse.total || 0)
      setCurrentPage(page)
      setUsers(usersResponse.items || [])

      const allCertsResponse = await certificateService.getCertificates({ limit: 1000 })
      calculateStats(allCertsResponse.items)

      if (!showLoadingIndicator) {
        showSuccess("Lista de certificados atualizada!")
      }
    } catch (error) {
      showError("Erro ao carregar certificados.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [itemsPerPage, calculateStats, showError, showSuccess])

  useEffect(() => {
    fetchPageData(currentPage, searchQuery, filters)
  }, [currentPage, fetchPageData])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchPageData(1, searchQuery, filters)
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined || value === null) {
      delete (newFilters as any)[key];
    } else {
      (newFilters as any)[key] = value;
    }
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPageData(1, searchQuery, filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({});
    setCurrentPage(1);
    fetchPageData(1, '', {});
  };

  const handleRefresh = () => {
    fetchPageData(currentPage, searchQuery, filters, false)
  }

  const handleDelete = async (certificate: CertificateResponseDto) => {
    if (!confirm(`Tem certeza que deseja excluir o certificado "${certificate.document}"?`)) return

    try {
      setLoading(true)
      await certificateService.deleteCertificate(certificate.id)
      showSuccess("Certificado excluído com sucesso.")
      await fetchPageData(currentPage, searchQuery, filters, false)
    } catch (error) {
      showError("Erro ao excluir certificado.")
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const getUserName = (userId: string | null | undefined) => {
    if (!userId) return 'N/A';
    const user = users.find(u => u.id.toString() === userId);
    return user?.full_name || 'Usuário não encontrado';
  }

  return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Certificados</h1>
                <p className="text-gray-600 mt-1">Consulte e gerencie os certificados emitidos</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleRefresh} variant="outline" disabled={refreshing} className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                <Button onClick={() => alert("Funcionalidade de 'Novo Certificado' a ser implementada.")} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Certificado
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Award} title="Total" value={stats.totalCertificates} subtitle="Certificados" color="purple" />
              <StatCard icon={CheckCircle} title="Recriáveis" value={stats.recreatable} subtitle="Disponíveis" color="green" />
              <StatCard icon={BookOpen} title="Programas" value={stats.programs} subtitle="Distintos" color="blue" />
              <StatCard icon={Users} title="Usuários" value={stats.usersWithCerts} subtitle="Certificados" color="amber" />
            </div>

            {/* Search & Filter Trigger */}
            <div className="flex gap-3">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por documento, licença ou nome do usuário..."
                    value={searchQuery}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </form>
              <Button onClick={() => setShowFilterPanel(!showFilterPanel)} variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select
                    value={filters.recreate === undefined ? '' : String(filters.recreate)}
                    onChange={(e) => handleFilterChange('recreate', e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    <option value="true">Recriável</option>
                    <option value="false">Não Recriável</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Programa</label>
                  <select
                    value={filters.tv_show_name || ''}
                    onChange={(e) => handleFilterChange('tv_show_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos os Programas</option>
                    <option value="Programa Educativo 1">Programa Educativo 1</option>
                    <option value="Programa Educativo 2">Programa Educativo 2</option>
                    <option value="Programa Educativo 3">Programa Educativo 3</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={clearFilters}>Limpar Filtros</Button>
                <Button onClick={applyFilters}>Aplicar</Button>
              </div>
            </div>
          )}

          {/* Content */}
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Carregando certificados...</span>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Nenhum certificado encontrado</p>
                <p className="text-gray-400 text-sm">{searchQuery || Object.keys(filters).length > 0 ? "Tente ajustar sua busca ou filtros." : "Nenhum certificado no sistema."}</p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Programa</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">{cert.document}</div>
                            <div className="text-xs text-gray-500 font-mono">{cert.license_code}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-800">{getUserName(cert.user_id)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{cert.tv_show_name}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant={cert.recreate ? 'success' : 'secondary'}>
                              {cert.recreate ? 'Recriável' : 'Não Recriável'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="ghost" size="sm" onClick={() => alert(`Visualizar: ${cert.document}`)} className="text-blue-600 hover:text-blue-900"><Eye className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => alert(`Editar: ${cert.document}`)} className="text-green-600 hover:text-green-900"><Edit className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(cert)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-4">
                  {certificates.map(cert => (
                    <div key={cert.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">{cert.document}</h3>
                          <p className="text-sm text-gray-500 font-mono">{cert.license_code}</p>
                        </div>
                        <Badge variant={cert.recreate ? 'success' : 'secondary'}>{cert.recreate ? 'Recriável' : 'Não Recriável'}</Badge>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center text-sm"><User className="w-4 h-4 mr-2 text-gray-400"/>{getUserName(cert.user_id)}</div>
                        <div className="flex items-center text-sm"><BookOpen className="w-4 h-4 mr-2 text-gray-400"/>{cert.tv_show_name}</div>
                      </div>
                      <div className="p-4 border-t border-gray-100 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => alert(`Visualizar: ${cert.document}`)}>Ver</Button>
                        <Button variant="outline" size="sm" onClick={() => alert(`Editar: ${cert.document}`)}>Editar</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(cert)}>Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Próxima</Button>
              </div>
            </div>
          )}
        </div>
      </div>
  )
}
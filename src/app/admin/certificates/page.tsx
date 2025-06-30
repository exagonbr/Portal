'use client'

import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash/debounce'
import {
  Award,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  User,
  BookOpen,
  Shield,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { formatDate } from '@/utils/date'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastManager'
import { Badge } from '@/components/ui/Badge'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import { Button } from '@/components/ui/Button'
import { CertificateFormModal } from '@/components/admin/CertificateFormModal'
import {
  Certificate,
  CertificateFilters,
  CertificateListResponse,
  CERTIFICATE_TYPE_LABELS,
  CERTIFICATE_TYPE_COLORS,
  CertificateType
} from '@/types/certificate'
import { UserRole } from '@/types/roles'

// Interfaces para as colunas e ações da tabela
interface CRUDColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => React.ReactNode
  width?: string
}

interface CRUDAction<T> {
  label: string
  icon: React.ReactNode
  onClick: (item: T) => void
  variant?: string
  className?: string
}

// Componente de notificação
const Notification = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : AlertCircle

  return (
    <div className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center justify-between mb-4`}>
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Modal de detalhes do certificado
const CertificateDetailsModal = ({ 
  certificate, 
  onClose,
  onEdit,
  onDelete
}: { 
  certificate: Certificate | null; 
  onClose: () => void;
  onEdit?: (certificate: Certificate) => void;
  onDelete?: (certificate: Certificate) => void;
}) => {
  if (!certificate) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{certificate.title}</h2>
                <p className="text-purple-100">{certificate.user?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações do Certificado</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Award className="h-4 w-4" />
                  <span>Tipo: {CERTIFICATE_TYPE_LABELS[certificate.certificate_type]}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Emitido em: {formatDate(certificate.issued_date)}</span>
                </div>
                {certificate.expiry_date && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Expira em: {formatDate(certificate.expiry_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4" />
                  <span>Código: {certificate.verification_code}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Beneficiário</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{certificate.user?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{certificate.user?.email}</span>
                </div>
                {certificate.course && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="h-4 w-4" />
                    <span>Curso: {certificate.course.title}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {certificate.description && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Descrição</h3>
              <p className="text-slate-600">{certificate.description}</p>
            </div>
          )}

          {certificate.certificate_url && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Arquivo</h3>
              <a
                href={certificate.certificate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4" />
                Visualizar Certificado
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="secondary"
                  onClick={() => onEdit(certificate)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              )}
              
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(certificate)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </Button>
              )}
            </div>
            
            <Button
              variant="default"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Paginação
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6 gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-slate-100'}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <span className="px-4 py-2 text-sm">
        Página {currentPage} de {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-slate-100'}`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// Componente para estado vazio
const EmptyState = ({
  onClearFilters,
  hasFilters
}: {
  onClearFilters: () => void;
  hasFilters: boolean;
}) => {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-slate-200 mt-4">
      <Award className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-xl font-bold text-slate-800">Nenhum certificado encontrado</h3>
      <p className="mt-2 text-base text-slate-600 max-w-md mx-auto">
        {hasFilters
          ? "Tente ajustar seus filtros de busca ou limpar todos os filtros para ver mais resultados."
          : "Não há certificados cadastrados ainda."}
      </p>
      <div className="mt-6 flex justify-center items-center gap-3">
        {hasFilters && (
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default function ManageCertificates() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filters, setFilters] = useState<CertificateFilters>({})
  const [showFilters, setShowFilters] = useState(true)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null)
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  // Verificar autorização
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Verificar se é SYSTEM_ADMIN ou se tem certificados
    const isSystemAdmin = user.role === UserRole.SYSTEM_ADMIN
    if (!isSystemAdmin) {
      // TODO: Verificar se o usuário tem certificados
      // Por enquanto, permitir acesso para todos os usuários logados
    }
  }, [user, router])

  // Função para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Carregar certificados
  const loadCertificates = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.certificate_type && { certificate_type: filters.certificate_type }),
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.course_id && { course_id: filters.course_id }),
        ...(filters.is_active !== undefined && { is_active: filters.is_active.toString() }),
        ...(filters.sort_by && { sort_by: filters.sort_by }),
        ...(filters.sort_order && { sort_order: filters.sort_order }),
      });

      const response = await fetch(`/api/certificates?${params}`);
      
      if (!response.ok) {
        throw new Error('Erro ao carregar certificados');
      }

      const data: CertificateListResponse = await response.json();

      if (data.success) {
        setCertificates(data.data);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setTotalItems(data.pagination.total);
        }
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error: any) {
      console.error('Erro ao carregar certificados:', error);
      showError(error.message || 'Erro ao carregar certificados');
      setCertificates([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, itemsPerPage, filters, showError]);

  useEffect(() => {
    loadCertificates();
    loadUsersAndCourses();
  }, [loadCertificates]);

  // Carregar usuários e cursos para o formulário
  const loadUsersAndCourses = async () => {
    try {
      // Carregar usuários (simplificado - você pode ajustar conforme sua API)
      const usersResponse = await fetch('/api/users?limit=1000');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        if (usersData.success && usersData.data) {
          setUsers(usersData.data.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email
          })));
        }
      }

      // Carregar cursos (simplificado - você pode ajustar conforme sua API)
      const coursesResponse = await fetch('/api/courses?limit=1000');
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        if (coursesData.success && coursesData.data) {
          setCourses(coursesData.data.map((c: any) => ({
            id: c.id,
            title: c.title
          })));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuários e cursos:', error);
    }
  };

  // Função de busca
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query)
    setFilters(prev => ({ ...prev, search: query }))
    setCurrentPage(1)
  }, [])

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true)
    loadCertificates(false)
  }

  // Visualizar detalhes do certificado
  const handleViewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setShowDetailsModal(true)
  }

  // Editar certificado
  const handleEditCertificate = (certificate: Certificate) => {
    setEditingCertificate(certificate)
    setShowCreateModal(true)
  }

  // Criar novo certificado
  const handleCreateCertificate = () => {
    setEditingCertificate(null)
    setShowCreateModal(true)
  }

  // Salvar certificado (criar ou editar)
  const handleSaveCertificate = async (formData: any) => {
    try {
      const url = editingCertificate 
        ? `/api/certificates/${editingCertificate.id}`
        : '/api/certificates';
      
      const method = editingCertificate ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar certificado');
      }

      const result = await response.json();
      if (result.success) {
        showSuccess(editingCertificate ? 'Certificado atualizado com sucesso!' : 'Certificado criado com sucesso!');
        loadCertificates();
        setShowCreateModal(false);
        setEditingCertificate(null);
      } else {
        throw new Error(result.message || 'Erro ao salvar certificado');
      }
    } catch (error: any) {
      console.error('Erro ao salvar certificado:', error);
      showError(error.message || 'Erro ao salvar certificado');
    }
  }

  // Excluir certificado
  const handleDeleteCertificate = async (certificate: Certificate) => {
    if (!window.confirm('Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const response = await fetch(`/api/certificates/${certificate.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir certificado');
      }

      showSuccess('Certificado excluído com sucesso!')
      loadCertificates()
    } catch (error: any) {
      console.error('Erro ao excluir certificado:', error)
      showError(error.message || 'Erro ao excluir certificado')
    }
  }

  // Função para atualizar um filtro específico com debounce
  const updateFilter = useCallback(
    debounce((key: string, value: any) => {
      setCurrentPage(1);
      setFilters(prev => {
        if (value === '' || value === undefined || value === null) {
          const newFilters = { ...prev }
          delete newFilters[key as keyof CertificateFilters]
          return newFilters
        }
        
        return {
          ...prev,
          [key]: value
        };
      })
    }, 500),
    []
  )

  // Limpar filtros
  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    showSuccess('Filtros limpos com sucesso')
    loadCertificates()
  }, [loadCertificates, showSuccess])

  // Função para mudar de página
  const handlePageChange = useCallback(async (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [])

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return Object.keys(filters).length > 0 && 
      Object.values(filters).some(value => 
        value !== undefined && value !== '' && 
        (typeof value !== 'object' || Object.keys(value).length > 0)
      );
  };

  // Exportar certificados
  const handleExport = async () => {
    try {
      showSuccess('Exportação iniciada! Você receberá um email quando estiver pronta.')
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      showError(error.message || 'Erro ao exportar certificados')
    }
  }

  const columns: CRUDColumn<Certificate>[] = [
    {
      key: 'title',
      label: 'Certificado',
      sortable: true,
      width: '300px',
      render: (value, certificate, index) => {
        if (!certificate) return '-'
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 truncate">{certificate.title}</div>
              <div className="text-xs text-slate-500 truncate">
                {certificate.description || 'Sem descrição'}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'user',
      label: 'Beneficiário',
      sortable: false,
      width: '200px',
      render: (value, certificate, index) => {
        if (!certificate?.user) return '-'
        return (
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-slate-700 truncate">{certificate.user.name}</div>
              <div className="text-xs text-slate-500 truncate">{certificate.user.email}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'certificate_type',
      label: 'Tipo',
      sortable: true,
      width: '150px',
      render: (value, certificate, index) => {
        if (!certificate) return '-'
        const type = certificate.certificate_type
        return (
          <Badge className={`${CERTIFICATE_TYPE_COLORS[type]} px-2 py-1 text-xs font-medium`}>
            {CERTIFICATE_TYPE_LABELS[type]}
          </Badge>
        )
      }
    },
    {
      key: 'issued_date',
      label: 'Emissão',
      sortable: true,
      width: '120px',
      render: (value, certificate, index) => {
        if (!certificate || !certificate.issued_date) return '-'
        const date = new Date(certificate.issued_date)
        const formattedDate = date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-green-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-700" title={formatDate(certificate.issued_date)}>
              {formattedDate}
            </span>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '90px',
      render: (value, certificate, index) => {
        if (!certificate) return '-'
        const isActive = certificate.is_active === true
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            {isActive ? "Ativo" : "Inativo"}
          </div>
        )
      }
    }
  ]

  // Definir ações personalizadas para o GenericCRUD
  const customActions: CRUDAction<Certificate>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-3 w-3" />,
      onClick: handleViewCertificate,
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 text-xs'
    },
    {
      label: 'Editar',
      icon: <Edit className="h-3 w-3" />,
      onClick: handleEditCertificate,
      variant: 'ghost',
      className: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 text-xs'
    }
  ]

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto py-8">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
        
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Certificados</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">
                Total: {totalItems} certificados
              </span>
              <Button
                onClick={handleCreateCertificate}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                Novo Certificado
              </Button>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 ${refreshing ? 'animate-spin' : ''}`}
                title="Atualizar lista"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1 ${
                  hasActiveFilters() ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                }`}
                title="Filtros"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Filtros</span>
                {hasActiveFilters() && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white">
                    {Object.keys(filters).length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Resumo dos filtros ativos */}
        {!showFilters && hasActiveFilters() && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Filtros ativos:</span>
              {filters.search && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Busca: &quot;{filters.search}&quot;
                </span>
              )}
              {filters.certificate_type && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Tipo: {CERTIFICATE_TYPE_LABELS[filters.certificate_type]}
                </span>
              )}
              {filters.is_active !== undefined && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {filters.is_active ? 'Ativo' : 'Inativo'}
                </span>
              )}
              <button
                onClick={handleClearFilters}
                className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200 transition-colors"
              >
                Limpar todos
              </button>
            </div>
          </div>
        )}

        {/* Seção de filtros */}
        {showFilters && (
          <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-purple-800">Filtros de Certificados</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasActiveFilters() && (
                  <Button
                    variant="secondary"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Filtro por Busca */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <Search className="h-4 w-4 text-purple-500" />
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search || ''}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Título, descrição ou código"
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Filtro por Tipo */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <Award className="h-4 w-4 text-purple-500" />
                  Tipo
                </label>
                <select
                  value={filters.certificate_type || ''}
                  onChange={(e) => updateFilter('certificate_type', e.target.value)}
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Todos os tipos</option>
                  {Object.entries(CERTIFICATE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  Status
                </label>
                <select
                  value={filters.is_active !== undefined ? filters.is_active.toString() : ''}
                  onChange={(e) => updateFilter('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Todos os status</option>
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>

              {/* Filtro por Ordenação */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-purple-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-purple-700">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Ordenar por
                </label>
                <select
                  value={filters.sort_by || ''}
                  onChange={(e) => updateFilter('sort_by', e.target.value)}
                  className="w-full rounded-lg border border-purple-200 bg-white px-4 py-2.5 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="">Padrão</option>
                  <option value="title">Título</option>
                  <option value="issued_date">Data de Emissão</option>
                  <option value="certificate_type">Tipo</option>
                  <option value="created_at">Data de Criação</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Lista de certificados */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-500" />
                <span className="text-lg text-slate-600">Carregando certificados...</span>
              </div>
            </div>
          ) : certificates.length === 0 ? (
            <EmptyState onClearFilters={handleClearFilters} hasFilters={hasActiveFilters()} />
          ) : (
            <>
              {/* Tabela de certificados */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column.key as string}
                          className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                          style={{ width: column.width }}
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-32">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {certificates.map((certificate, index) => (
                      <tr key={certificate.id} className="hover:bg-slate-50 transition-colors">
                        {columns.map((column) => (
                          <td key={column.key as string} className="px-6 py-4 whitespace-nowrap">
                            {column.render ? column.render(certificate[column.key as keyof Certificate], certificate, index) : String(certificate[column.key as keyof Certificate] || '-')}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {customActions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick(certificate)}
                                className={`p-1 rounded hover:bg-slate-100 transition-colors ${action.className || ''}`}
                                title={action.label}
                              >
                                {action.icon}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>

        {/* Modal de detalhes */}
        {showDetailsModal && (
          <CertificateDetailsModal
            certificate={selectedCertificate}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedCertificate(null)
            }}
            onEdit={handleEditCertificate}
            onDelete={handleDeleteCertificate}
          />
        )}

        {/* Modal de criação/edição */}
        <CertificateFormModal
          certificate={editingCertificate}
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCertificate(null)
          }}
          onSave={handleSaveCertificate}
          users={users}
          courses={courses}
        />
      </div>
    </AuthenticatedLayout>
  )
}
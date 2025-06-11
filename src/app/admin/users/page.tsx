'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Users,
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  UserCheck,
  UserX,
  Key,
  History,
  Settings,
  BarChart3,
  Bell,
  FileText,
  Award,
  Clock,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { userService, resetUserPassword } from '@/services/userService'
import { roleService } from '@/services/roleService'
import { institutionService } from '@/services/institutionService'
import { UserResponseDto, UserFilterDto, RoleResponseDto, InstitutionResponseDto, UserWithRoleDto } from '@/types/api'
import { formatDate } from '@/utils/date'
import UserModal from '@/components/modals/UserModal'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastManager'
import GenericCRUD, { CRUDColumn, CRUDAction } from '@/components/crud/GenericCRUD'
import { Badge } from '@/components/ui/Badge'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import Modal from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

// Estendendo o tipo UserResponseDto para incluir campos adicionais
interface ExtendedUserResponseDto extends UserResponseDto {
  username?: string
  avatar?: string
  telefone?: string
  endereco?: string
  is_active: boolean
  created_at: string
  updated_at: string
  role_name?: string
  institution_name?: string
}

// Estendendo a interface UserFilterDto para incluir as propriedades adicionais de filtro
interface ExtendedUserFilterDto extends UserFilterDto {
  name?: string;
  email?: string;
  role_id?: string;
  institution_id?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
}

// Interface para o UserDto usado no modal
interface UserDto {
  id?: string
  name: string
  email: string
  username?: string
  role?: string
  role_id?: string
  avatar?: string
  isActive?: boolean
  institution_id?: string
  institution_name?: string
  createdAt?: string
  updatedAt?: string
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

// Componente de modal de detalhes do usuário
const UserDetailsModal = ({ 
  user, 
  onClose,
  onEdit,
  onToggleStatus,
  onResetPassword
}: { 
  user: ExtendedUserResponseDto | null; 
  onClose: () => void;
  onEdit?: (user: ExtendedUserResponseDto) => void;
  onToggleStatus?: (user: ExtendedUserResponseDto) => void;
  onResetPassword?: (user: ExtendedUserResponseDto) => void;
}) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {user.avatar ? (
                <Image 
                  className="h-16 w-16 rounded-full object-cover border-2 border-white" 
                  src={user.avatar} 
                  alt={user.name} 
                  width={64}
                  height={64}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-primary-light/80">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-light/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações Pessoais</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {user.telefone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4" />
                    <span>{user.telefone}</span>
                  </div>
                )}
                {user.endereco && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span>{user.endereco}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">Informações do Sistema</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Shield className="h-4 w-4" />
                  <span>Função: {user.role_name || 'Não definida'}</span>
                </div>
                {user.institution_name && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4" />
                    <span>Instituição: {user.institution_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span>Cadastrado em: {formatDate(user.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Usuário Ativo</span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">Usuário Inativo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas do usuário */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-3">Estatísticas</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Cursos</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Atividades</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0</div>
                <div className="text-sm text-slate-600">Certificados</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-primary-dark">0h</div>
                <div className="text-sm text-slate-600">Tempo Total</div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex flex-wrap justify-between items-center">
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  variant="secondary"
                  onClick={() => onEdit(user)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Button>
              )}
              
              {onToggleStatus && (
                <Button
                  variant={user.is_active ? "destructive" : "success"}
                  onClick={() => onToggleStatus(user)}
                  className="flex items-center gap-1"
                >
                  {user.is_active ? (
                    <>
                      <UserX className="h-4 w-4" />
                      <span>Desativar</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      <span>Ativar</span>
                    </>
                  )}
                </Button>
              )}
              
              {onResetPassword && (
                <Button
                  variant="warning"
                  onClick={() => onResetPassword(user)}
                  className="flex items-center gap-1"
                >
                  <Key className="h-4 w-4" />
                  <span>Resetar Senha</span>
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

// Modal de Histórico do Usuário
const UserHistoryModal = ({
  user,
  onClose
}: {
  user: ExtendedUserResponseDto | null;
  onClose: () => void;
}) => {
  if (!user) return null

  // Mock data para histórico - substituir por dados reais da API
  const historyData = [
    { date: '2024-01-15', action: 'Login realizado', details: 'IP: 192.168.1.1' },
    { date: '2024-01-14', action: 'Perfil atualizado', details: 'Email alterado' },
    { date: '2024-01-13', action: 'Senha alterada', details: 'Alteração via perfil' },
    { date: '2024-01-12', action: 'Curso concluído', details: 'Matemática Básica' },
    { date: '2024-01-11', action: 'Login realizado', details: 'IP: 192.168.1.2' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Histórico de Atividades</h2>
                <p className="text-blue-100">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-blue-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-4">
            {historyData.map((item, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-blue-500 mt-1" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-slate-800">{item.action}</h4>
                      <p className="text-sm text-slate-600">{item.details}</p>
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(item.date)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end">
            <Button variant="default" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de Permissões do Usuário
const UserPermissionsModal = ({
  user,
  onClose,
  onSave,
  permissions,
  handlePermissionChange,
}: {
  user: ExtendedUserResponseDto | null;
  onClose: () => void;
  onSave?: () => void;
  permissions: any;
  handlePermissionChange: (module: string, action: string, value: boolean) => void;
}) => {
  if (!user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Gerenciar Permissões</h2>
                <p className="text-purple-100">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-purple-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-6">
            {Object.entries(permissions).map(([module, actions]) => (
              <div key={module} className="border border-slate-200 rounded-lg p-4">
                <h3 className="font-semibold text-slate-800 mb-3 capitalize">{module}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(actions as any).map(([action, enabled]) => (
                    <label key={action} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={enabled as boolean}
                        onChange={(e) => handlePermissionChange(module, action, e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      <span className="text-sm capitalize">{action}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="default" onClick={onSave}>
              Salvar Permissões
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de Relatórios do Usuário
const UserReportsModal = ({
  user,
  onClose
}: {
  user: ExtendedUserResponseDto | null;
  onClose: () => void;
}) => {
  if (!user) return null

  const reportTypes = [
    { id: 'activity', name: 'Relatório de Atividades', description: 'Histórico completo de ações do usuário' },
    { id: 'performance', name: 'Relatório de Performance', description: 'Desempenho em cursos e atividades' },
    { id: 'attendance', name: 'Relatório de Frequência', description: 'Presença em aulas e eventos' },
    { id: 'certificates', name: 'Relatório de Certificados', description: 'Certificados obtidos pelo usuário' }
  ]

  const handleGenerateReport = (reportType: string) => {
    // Implementar geração de relatório
    console.log(`Gerando relatório ${reportType} para usuário ${user.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Relatórios do Usuário</h2>
                <p className="text-green-100">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-green-200">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4">
            {reportTypes.map((report) => (
              <div key={report.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-slate-800">{report.name}</h3>
                    <p className="text-sm text-slate-600">{report.description}</p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleGenerateReport(report.id)}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Gerar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end">
            <Button variant="default" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de Notificações do Usuário
const UserNotificationsModal = ({
  user,
  onClose,
  notifications,
}: {
  user: ExtendedUserResponseDto | null;
  onClose: () => void;
  notifications: any[];
}) => {
  if (!user) return null

  const handleSendNotification = () => {
    // Implementar envio de notificação
    console.log(`Enviando notificação para usuário ${user.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Notificações</h2>
                <p className="text-orange-100">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-orange-200">
              <X className="h-6 w-6" />
            </button>
          </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Histórico de Notificações</h3>
            <Button
              variant="default"
              onClick={handleSendNotification}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              Enviar Notificação
            </Button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'bg-slate-50' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-800">{notification.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">{formatDate(notification.date)}</span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-auto"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex justify-end">
            <Button variant="default" onClick={onClose}>
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
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let pages: (number | string)[] = [];
    
    if (totalPages <= maxPagesToShow) {
      // Se o número total de páginas for menor ou igual ao máximo, mostre todas
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Se o número total de páginas for maior que o máximo
      const firstPage = 1;
      const lastPage = totalPages;
      
      if (currentPage <= 3) {
        // Se estiver nas primeiras páginas
        pages = [1, 2, 3, 4, '...', lastPage];
      } else if (currentPage >= lastPage - 2) {
        // Se estiver nas últimas páginas
        pages = [firstPage, '...', lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
      } else {
        // Se estiver em algum lugar no meio
        pages = [firstPage, '...', currentPage - 1, currentPage, currentPage + 1, '...', lastPage];
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6 gap-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-slate-100'}`}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2">...</span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 rounded-md ${currentPage === page 
              ? 'bg-primary-DEFAULT text-white' 
              : 'hover:bg-slate-100'}`}
          >
            {page}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'hover:bg-slate-100'}`}
        aria-label="Próxima página"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// Criar um componente de filtro com indicador de carregamento
const FilterLoading = () => (
  <div className="flex justify-center items-center h-8">
    <div className="animate-spin w-4 h-4 border-2 border-primary-DEFAULT border-t-transparent rounded-full"></div>
  </div>
);

export default function ManageUsers() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [users, setUsers] = useState<ExtendedUserResponseDto[]>([])
  const [roles, setRoles] = useState<RoleResponseDto[]>([])
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExtendedUserResponseDto | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [filters, setFilters] = useState<ExtendedUserFilterDto>({})
  const [showFilters, setShowFilters] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [showStatusChangeModal, setShowStatusChangeModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [showReportsModal, setShowReportsModal] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [permissions, setPermissions] = useState({
    users: { create: true, read: true, update: false, delete: false },
    courses: { create: false, read: true, update: false, delete: false },
    reports: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: false, update: false, delete: false }
  });
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Bem-vindo ao sistema', message: 'Sua conta foi criada com sucesso', date: '2024-01-15', read: true },
    { id: 2, title: 'Novo curso disponível', message: 'Matemática Avançada está disponível', date: '2024-01-14', read: false },
    { id: 3, title: 'Certificado gerado', message: 'Seu certificado de Matemática Básica está pronto', date: '2024-01-13', read: true }
  ]);

  const handlePermissionChange = (module: string, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...(prev[module as keyof typeof prev] || {}),
        [action]: value
      }
    }))
  }


  // Função para converter ExtendedUserResponseDto para UserDto
  const convertToUserDto = (user: ExtendedUserResponseDto): UserDto => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role_name,
      role_id: user.role_id,
      avatar: user.avatar,
      isActive: user.is_active,
      institution_id: user.institution_id,
      institution_name: user.institution_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }
  }

  // Função para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  // Carregar dados auxiliares (roles e instituições)
  const loadAuxiliaryData = async () => {
    try {
      const [rolesResponse, institutionsResponse] = await Promise.all([
        roleService.getActiveRoles(),
        institutionService.getActiveInstitutions()
      ])
      setRoles(rolesResponse || [])
      setInstitutions(institutionsResponse || [])
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error)
    }
  }

  // Carregar usuários
  const loadUsers = useCallback(async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) setLoading(true);

    try {
      const params: ExtendedUserFilterDto = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder,
        ...filters,
      };

      const response = searchTerm
        ? await userService.searchUsers(searchTerm, params)
        : await userService.getUsers(params);

      console.log('Resposta da API:', response);

      const enrichedUsers = response.items.map(user => {
        const role = roles.find(r => r.id === user.role_id);
        const institution = institutions.find(i => i.id === user.institution_id);
        return {
          ...user,
          role_name: (user as ExtendedUserResponseDto).role_name || role?.name || 'Não definida',
          institution_name: (user as ExtendedUserResponseDto).institution_name || institution?.name || 'Não vinculada',
        } as ExtendedUserResponseDto;
      });

      console.log('Dados enriquecidos:', enrichedUsers);

      setUsers(enrichedUsers);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalItems(response.pagination?.total || 0);

    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      showError(error.message || 'Erro ao carregar usuários');
      // Em caso de erro, limpa a lista para evitar exibir dados incorretos
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchTerm, filters, sortBy, sortOrder, itemsPerPage, roles, institutions, showError]);

  useEffect(() => {
    loadAuxiliaryData();
  }, []);

  useEffect(() => {
    if (roles.length > 0 || institutions.length > 0) {
      loadUsers();
    }
  }, [loadUsers, roles, institutions]);

  // Função de busca
  const handleSearch = () => {
    setCurrentPage(1)
    loadUsers()
  }

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true)
    loadUsers(false)
  }

  // Criar novo usuário
  const handleCreateUser = () => {
    setSelectedUser(null)
    setShowModal(true)
  }

  // Editar usuário
  const handleEditUser = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowModal(true)
  }

  // Visualizar detalhes do usuário
  const handleViewUser = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowDetailsModal(true)
  }

  // Excluir usuário
  const handleDeleteUser = async (user: ExtendedUserResponseDto) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      await userService.deleteUser(user.id)
      showSuccess('Usuário excluído com sucesso!')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error)
      showError(error.message || 'Erro ao excluir usuário')
    }
  }

  // Alternar status do usuário
  const handleToggleStatus = async (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowStatusChangeModal(true)
  }

  // Confirmar alteração de status
  const confirmStatusChange = async () => {
    if (!selectedUser) return

    try {
      const newStatus = !selectedUser.is_active
      await userService.updateUser(selectedUser.id, { is_active: newStatus })
      showSuccess(`Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso!`)
      setShowStatusChangeModal(false)
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao alterar status:', error)
      showError(error.message || 'Erro ao alterar status do usuário')
    }
  }

  // Resetar senha do usuário
  const handleResetPassword = async (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowResetPasswordModal(true)
  }

  // Confirmar reset de senha
  const confirmResetPassword = async () => {
    if (!selectedUser) return

    try {
      // Implementar lógica de reset de senha quando disponível na API
      await resetUserPassword(selectedUser.id)
      showSuccess('Senha resetada com sucesso! Um email foi enviado ao usuário.')
      setShowResetPasswordModal(false)
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error)
      showError(error.message || 'Erro ao resetar senha')
    }
  }

  // Visualizar histórico do usuário
  const handleViewHistory = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowHistoryModal(true)
  }

  // Gerenciar permissões do usuário
  const handleManagePermissions = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowPermissionsModal(true)
  }

  // Visualizar relatórios do usuário
  const handleViewReports = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowReportsModal(true)
  }

  // Visualizar notificações do usuário
  const handleViewNotifications = (user: ExtendedUserResponseDto) => {
    setSelectedUser(user)
    setShowNotificationsModal(true)
  }

  // Exportar usuários
  const handleExport = async () => {
    try {
      const result = await userService.exportUsers(filters, 'csv')
      showSuccess('Exportação iniciada! Você receberá um email quando estiver pronta.')
    } catch (error: any) {
      console.error('Erro ao exportar:', error)
      showError(error.message || 'Erro ao exportar usuários')
    }
  }

  // Importar usuários
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await userService.importUsers(file)
      showSuccess('Importação iniciada! Você receberá um email com o resultado.')
      loadUsers()
    } catch (error: any) {
      console.error('Erro ao importar:', error)
      showError(error.message || 'Erro ao importar usuários')
    }
  }

  // Função para atualizar um filtro específico
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => {
      // Se o valor for vazio, remova a propriedade do objeto
      if (value === '' || value === undefined) {
        const newFilters = { ...prev }
        delete newFilters[key as keyof ExtendedUserFilterDto]
        return newFilters
      }
      
      // Caso contrário, atualize com o novo valor
      return {
        ...prev,
        [key]: value
      }
    })
  }

  // Vamos adicionar um efeito para carregar os dados quando os filtros mudarem
  useEffect(() => {
    // Aplicar filtros imediatamente e resetar para a primeira página
    if (Object.keys(filters).length > 0) {
      setCurrentPage(1)
      loadUsers()
    }
  }, [filters.role_id, filters.institution_id, filters.is_active]) // Apenas os filtros principais que devem atualizar imediatamente

  // Aplicar filtros
  const handleApplyFilters = () => {
    setCurrentPage(1)
    setShowFilters(false)
    loadUsers()
  }

  // Limpar filtros
  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    setSortBy('name')
    setSortOrder('asc')
    setShowFilters(false)
    loadUsers()
  }

  // Função para mudar de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Rolagem suave para o topo da lista quando mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Verificar se há filtros ativos
  const hasActiveFilters = () => {
    return Object.keys(filters).length > 0 && 
      Object.values(filters).some(value => 
        value !== undefined && value !== '' && 
        (typeof value !== 'object' || Object.keys(value).length > 0)
      );
  };

  // Função para obter cor do role
  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'bg-red-100 text-red-800'
      case 'teacher':
      case 'professor':
        return 'bg-blue-100 text-blue-800'
      case 'student':
      case 'aluno':
      case 'estudante':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Função para alterar o número de itens por página
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
    loadUsers()
  }

  const headerActions = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">
        Total: {totalItems} usuários
      </span>
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
  )

  const getRoleBadgeVariant = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
      case 'administrador':
        return 'danger'
      case 'teacher':
      case 'professor':
        return 'warning'
      case 'student':
      case 'aluno':
      case 'estudante':
        return 'info'
      case 'coordinator':
      case 'coordenador':
        return 'success'
      default:
        return 'secondary'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador'
      case 'teacher': return 'Professor'
      case 'student': return 'Aluno'
      case 'coordinator': return 'Coordenador'
      default: return role
    }
  }

  const columns: CRUDColumn<ExtendedUserResponseDto>[] = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (user) => {
        if (!user) return '-'
        return (
          <div className="text-xs text-slate-600 truncate max-w-[120px]" title={user.id}>
            {user.id}
          </div>
        )
      }
    },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (user) => {
        if (!user) return '-'
        return (
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <Image
                className="h-10 w-10 rounded-full object-cover border-2 border-primary-light shadow-sm"
                src={user.avatar}
                alt={user.name}
                width={40}
                height={40}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-DEFAULT to-primary-dark flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user.name ? user.name.substring(0, 2).toUpperCase() : '??'}
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-800 block">{user.name || 'Sem nome'}</span>
              {user.username && <span className="text-xs text-slate-500 block">@{user.username}</span>}
            </div>
          </div>
        )
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user) => {
        if (!user || !user.email) return '-'
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800 hover:underline">
              {user.email}
            </a>
          </div>
        )
      }
    },
    {
      key: 'endereco',
      label: 'Endereço',
      render: (user) => {
        if (!user) return '-'
        return (
          <div className="text-slate-700">
            {user.endereco === undefined || user.endereco === '' || user.endereco === null
              ? 'Não informado'
              : user.endereco}
          </div>
        )
      }
    },
    {
      key: 'role_name',
      label: 'Função',
      sortable: true,
      render: (user) => {
        if (!user) return '-'
        const roleName = user.role_name || 'Não definida'
        return (
          <Badge variant={getRoleBadgeVariant(roleName)} className="px-3 py-1 font-medium shadow-sm">
            {roleName}
          </Badge>
        )
      }
    },
    {
      key: 'institution_name',
      label: 'Instituição',
      sortable: true,
      render: (user) => {
        if (!user) return '-'
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span className="text-slate-700 font-medium">
              {user.institution_name || 'Não vinculada'}
            </span>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (user) => {
        if (!user) return '-'
        const isActive = user.is_active === true
        return (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-sm font-semibold">
              {isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
        )
      }
    },
    {
      key: 'created_at',
      label: 'Cadastrado em',
      sortable: true,
      render: (user) => {
        if (!user || !user.created_at) return '-'
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-slate-700">
              {formatDate(user.created_at)}
            </span>
          </div>
        )
      }
    }
  ]

  // Definir ações personalizadas para o GenericCRUD
  const customActions: CRUDAction<ExtendedUserResponseDto>[] = [
    {
      label: 'Visualizar',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewUser,
      variant: 'default',
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
      permission: 'users.view'
    },
    {
      label: 'Editar',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditUser,
      variant: 'default',
      className: 'bg-amber-500 hover:bg-amber-600 text-white',
      permission: 'users.edit'
    },
    {
      label: 'Histórico',
      icon: <History className="h-4 w-4" />,
      onClick: handleViewHistory,
      variant: 'outline',
      className: 'border-blue-300 text-blue-700 hover:bg-blue-50',
      permission: 'users.view'
    },
    {
      label: 'Permissões',
      icon: <Shield className="h-4 w-4" />,
      onClick: handleManagePermissions,
      variant: 'outline',
      className: 'border-purple-300 text-purple-700 hover:bg-purple-50',
      permission: 'users.permissions'
    },
    {
      label: 'Relatórios',
      icon: <BarChart3 className="h-4 w-4" />,
      onClick: handleViewReports,
      variant: 'outline',
      className: 'border-green-300 text-green-700 hover:bg-green-50',
      permission: 'users.reports'
    },
    {
      label: 'Notificações',
      icon: <Bell className="h-4 w-4" />,
      onClick: handleViewNotifications,
      variant: 'outline',
      className: 'border-orange-300 text-orange-700 hover:bg-orange-50',
      permission: 'users.notifications'
    },
    {
      label: 'Resetar senha',
      icon: <Key className="h-4 w-4" />,
      onClick: handleResetPassword,
      variant: 'outline',
      className: 'border-yellow-300 text-yellow-700 hover:bg-yellow-50',
      permission: 'users.reset_password'
    },
    {
      label: 'Alternar status',
      icon: <Activity className="h-4 w-4" />,
      onClick: handleToggleStatus,
      variant: 'outline',
      className: (user) => user?.is_active
        ? 'border-red-300 text-red-700 hover:bg-red-50'
        : 'border-green-300 text-green-700 hover:bg-green-50',
      permission: 'users.edit'
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
        
        
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              Total: {totalItems} usuários
            </span>
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
        
        {/* Seção de filtros expostos */}
        {showFilters && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-blue-800">Filtros Avançados</h2>
              </div>
              <div className="flex items-center gap-3">
                {loading && (
                  <span className="text-sm text-slate-600 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm">
                    <div className="animate-spin w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    Atualizando...
                  </span>
                )}
                {hasActiveFilters() && (
                  <Button
                    variant="secondary"
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    Limpar filtros
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Filtro por Nome */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Users className="h-4 w-4 text-blue-500" />
                  Nome
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.name || ''}
                    onChange={(e) => updateFilter('name', e.target.value)}
                    placeholder="Buscar por nome (parcial)"
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                </div>
              </div>

              {/* Filtro por Email */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={filters.email || ''}
                    onChange={(e) => updateFilter('email', e.target.value)}
                    placeholder="Buscar por email (parcial)"
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                </div>
              </div>

              {/* Filtro por Role */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Shield className="h-4 w-4 text-purple-500" />
                  Função
                </label>
                <select
                  value={filters.role_id || ''}
                  onChange={(e) => updateFilter('role_id', e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas as funções</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Instituição */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Instituição
                </label>
                <select
                  value={filters.institution_id || ''}
                  onChange={(e) => updateFilter('institution_id', e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas as instituições</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Activity className="h-4 w-4 text-green-500" />
                  Status
                </label>
                <select
                  value={filters.is_active === undefined ? '' : filters.is_active ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      updateFilter('is_active', undefined);
                    } else {
                      updateFilter('is_active', value === 'true');
                    }
                  }}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Qualquer status</option>
                  <option value="true">✅ Ativo</option>
                  <option value="false">❌ Inativo</option>
                </select>
              </div>
              
              {/* Data de Criação - De */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Cadastrado de
                </label>
                <input
                  type="date"
                  value={filters.created_after || ''}
                  onChange={(e) => updateFilter('created_after', e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
              </div>
              
              {/* Data de Criação - Até */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Calendar className="h-4 w-4 text-orange-500" />
                  Cadastrado até
                </label>
                <input
                  type="date"
                  value={filters.created_before || ''}
                  onChange={(e) => updateFilter('created_before', e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-between items-center pt-4 border-t border-blue-200">
              <div className="text-sm text-slate-600">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Carregando resultados...</span>
                  </div>
                ) : hasActiveFilters() ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Exibindo <strong>{totalItems}</strong> usuários filtrados</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span>Use os filtros acima para refinar sua busca</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  onClick={handleExport}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                  disabled={loading}
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={handleImport}
                    className="hidden"
                    disabled={loading}
                  />
                  <Button
                    variant="default"
                    className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={loading}
                  >
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                </label>
              </div>
            </div>
          </div>
        )}
        
        <GenericCRUD
          title=""
          entityName="Usuário"
          entityNamePlural="Usuários"
          columns={columns}
          data={users}
          loading={loading}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onCreate={handleCreateUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onView={handleViewUser}
          customActions={customActions}
          createPermission="users.create"
          editPermission="users.edit"
          deletePermission="users.delete"
          viewPermission="users.view"
          showSearch={false}
          emptyMessage="Nenhum usuário encontrado. Verifique os filtros aplicados ou adicione novos usuários."
        />
      
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        
        <div className="text-center text-sm text-slate-500 mt-3">
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin w-3 h-3 border-2 border-primary-DEFAULT border-t-transparent rounded-full"></div>
            </div>
          ) : (
            `Exibindo ${users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - ${Math.min(currentPage * itemsPerPage, totalItems)} de ${totalItems} usuários`
          )}
        </div>

        <div className="flex justify-center mt-3 items-center gap-2">
          <span className="text-sm text-slate-600">Itens por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1 bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {showModal && (
          <UserModal
            show={showModal}
            user={selectedUser ? convertToUserDto(selectedUser) : null}
            onClose={() => {
              setShowModal(false)
              setSelectedUser(null)
            }}
            onSave={() => {
              setShowModal(false)
              setSelectedUser(null)
              loadUsers()
            }}
          />
        )}

        {showDetailsModal && (
          <UserDetailsModal
            user={selectedUser}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedUser(null)
            }}
            onEdit={handleEditUser}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
          />
        )}

        {/* Modal de Confirmação de Reset de Senha */}
        <Modal
          isOpen={showResetPasswordModal}
          onClose={() => setShowResetPasswordModal(false)}
          title="Resetar Senha"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              Tem certeza que deseja resetar a senha de <strong>{selectedUser?.name}</strong>? 
              Uma nova senha será gerada e enviada para o email do usuário.
            </p>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowResetPasswordModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="default"
                onClick={confirmResetPassword}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de Confirmação de Alteração de Status */}
        <Modal
          isOpen={showStatusChangeModal}
          onClose={() => setShowStatusChangeModal(false)}
          title="Alternar Status do Usuário"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-slate-600">
              {selectedUser?.is_active 
                ? `Tem certeza que deseja desativar o usuário ${selectedUser?.name}?` 
                : `Tem certeza que deseja ativar o usuário ${selectedUser?.name}?`}
            </p>
            
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowStatusChangeModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant={selectedUser?.is_active ? "destructive" : "success"}
                onClick={confirmStatusChange}
              >
                {selectedUser?.is_active ? 'Desativar' : 'Ativar'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de Histórico */}
        {showHistoryModal && (
          <UserHistoryModal
            user={selectedUser}
            onClose={() => {
              setShowHistoryModal(false)
              setSelectedUser(null)
            }}
          />
        )}

        {/* Modal de Permissões */}
        {showPermissionsModal && (
          <UserPermissionsModal
            user={selectedUser}
            onClose={() => {
              setShowPermissionsModal(false)
              setSelectedUser(null)
            }}
            onSave={() => {
              setShowPermissionsModal(false)
              setSelectedUser(null)
              showSuccess('Permissões atualizadas com sucesso!')
            }}
            permissions={permissions}
            handlePermissionChange={handlePermissionChange}
          />
        )}

        {/* Modal de Relatórios */}
        {showReportsModal && (
          <UserReportsModal
            user={selectedUser}
            onClose={() => {
              setShowReportsModal(false)
              setSelectedUser(null)
            }}
          />
        )}

        {/* Modal de Notificações */}
        {showNotificationsModal && (
          <UserNotificationsModal
            user={selectedUser}
            onClose={() => {
              setShowNotificationsModal(false)
              setSelectedUser(null)
            }}
            notifications={notifications}
          />
        )}
      </div>
    </AuthenticatedLayout>
  )
}

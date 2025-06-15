'use client'

import React, { useState, useEffect, useCallback } from 'react'
import debounce from 'lodash/debounce'
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
import { UserCreateModal } from '@/components/UserCreateModal'
import CreateUserForm from '@/components/CreateUserForm'

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
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Notificações</h2>
                <p className="text-orange-100">{user.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:text-orange-200">
              <X className="h-6 w-6" />
            </button>
          </div>
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

// Componente para estado vazio
const EmptyState = ({
  onClearFilters,
  onCreateUser,
  hasFilters
}: {
  onClearFilters: () => void;
  onCreateUser: () => void;
  hasFilters: boolean;
}) => {
  return (
    <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md border border-slate-200 mt-4">
      <Users className="mx-auto h-12 w-12 text-slate-400" />
      <h3 className="mt-4 text-xl font-bold text-slate-800">Nenhum usuário encontrado</h3>
      <p className="mt-2 text-base text-slate-600 max-w-md mx-auto">
        {hasFilters
          ? "Tente ajustar seus filtros de busca ou limpar todos os filtros para ver mais resultados."
          : "Parece que não há usuários cadastrados ainda. Que tal adicionar o primeiro?"}
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
export default function ManageUsers() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  // Debug: Log do usuário atual
  console.log('👤 Usuário atual:', {
    user: user ? {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    } : 'Não logado'
  })
  
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
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
  const [auxiliaryDataLoaded, setAuxiliaryDataLoaded] = useState(false);



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
  // Esta função foi otimizada para:
  // 1. Fazer chamadas paralelas para roles e instituições
  // 2. Tratar erros individualmente sem falhar completamente
  // 3. Usar dados mock como fallback quando a API falha
  // 4. Fornecer logs detalhados para debug
  // 5. Garantir que os filtros só funcionem após o carregamento
  const loadAuxiliaryData = async () => {
    try {
      console.log('🔄 Carregando dados auxiliares (roles e instituições)...');
      
      // Carrega roles e instituições em paralelo
      const [rolesResult, institutionsResult] = await Promise.allSettled([
        roleService.getActiveRoles(),
        institutionService.getActiveInstitutions()
      ]);

      // Processa resultado das roles
      let rolesData: RoleResponseDto[] = [];
      if (rolesResult.status === 'fulfilled') {
        console.log('🎭 Resultado das roles:', {
          status: rolesResult.status,
          value: rolesResult.value,
          isArray: Array.isArray(rolesResult.value),
          length: Array.isArray(rolesResult.value) ? rolesResult.value.length : 'N/A'
        });
        
        if (rolesResult.value && Array.isArray(rolesResult.value)) {
          rolesData = rolesResult.value;
          console.log('✅ Roles carregadas da API:', rolesData.map(r => ({ id: r.id, name: r.name })));
        } else {
          console.warn('⚠️ Roles retornadas não são um array válido:', rolesResult.value);
        }
      } else {
        console.error('❌ Erro ao carregar roles da API:', rolesResult.reason);
      }
      
      // Se não conseguiu carregar roles da API, usa dados mock
      if (rolesData.length === 0) {
        console.log('🔧 Usando roles mock como fallback...');
        const now = new Date().toISOString();
        rolesData = [
          { id: 'role-admin', name: 'Administrador', description: 'Acesso total ao sistema', created_at: now, updated_at: now },
          { id: 'role-teacher', name: 'Professor', description: 'Gerencia cursos e alunos', created_at: now, updated_at: now },
          { id: 'role-student', name: 'Estudante', description: 'Acessa os cursos e materiais', created_at: now, updated_at: now },
          { id: 'role-coordinator', name: 'Coordenador', description: 'Coordena professores e turmas', created_at: now, updated_at: now },
          { id: 'role-manager', name: 'Gerente', description: 'Gerencia instituição', created_at: now, updated_at: now },
          { id: 'role-guardian', name: 'Responsável', description: 'Responsável por estudante', created_at: now, updated_at: now },
        ];
        console.log('🔧 Roles mock criadas:', rolesData.map(r => ({ id: r.id, name: r.name })));
      }

      // Processa resultado das instituições
      let institutionsData: InstitutionResponseDto[] = [];
      if (institutionsResult.status === 'fulfilled') {
        console.log('🏢 Resultado das instituições:', {
          status: institutionsResult.status,
          value: institutionsResult.value,
          isArray: Array.isArray(institutionsResult.value),
          length: Array.isArray(institutionsResult.value) ? institutionsResult.value.length : 'N/A'
        });
        
        if (institutionsResult.value && Array.isArray(institutionsResult.value)) {
          institutionsData = institutionsResult.value;
          console.log('✅ Instituições carregadas da API:', institutionsData.map(i => ({ id: i.id, name: i.name })));
        } else {
          console.warn('⚠️ Instituições retornadas não são um array válido:', institutionsResult.value);
        }
      } else {
        console.error('❌ Erro ao carregar instituições da API:', institutionsResult.reason);
      }
      
      // Se não conseguiu carregar instituições da API, usa dados mock
      if (institutionsData.length === 0) {
        console.log('🔧 Usando instituições mock como fallback...');
        const now = new Date().toISOString();
        institutionsData = [
          { id: 'inst-sabercon', name: 'Escola SaberCon Digital', code: 'SABERCON', created_at: now, updated_at: now },
          { id: 'inst-exagon', name: 'Colégio Exagon Inovação', code: 'EXAGON', created_at: now, updated_at: now },
          { id: 'inst-devstrade', name: 'Centro Educacional DevStrade', code: 'DEVSTRADE', created_at: now, updated_at: now },
          { id: 'inst-unifesp', name: 'Universidade Federal de São Paulo', code: 'UNIFESP', created_at: now, updated_at: now },
          { id: 'inst-usp', name: 'Universidade de São Paulo', code: 'USP', created_at: now, updated_at: now },
        ];
        console.log('🔧 Instituições mock criadas:', institutionsData.map(i => ({ id: i.id, name: i.name })));
      }

      // Atualiza os estados
      setRoles(rolesData);
      setInstitutions(institutionsData);

      console.log('📊 Dados auxiliares finais carregados:', {
        roles: {
          count: rolesData.length,
          items: rolesData.map(r => ({ id: r.id, name: r.name }))
        },
        institutions: {
          count: institutionsData.length,
          items: institutionsData.map(i => ({ id: i.id, name: i.name }))
        }
      });

      console.log('✅ Dados auxiliares carregados com sucesso');

    } catch (error) {
      console.error('❌ Erro crítico ao carregar dados auxiliares:', error);
      showError('Falha ao carregar dados de apoio. Usando valores padrão.');
      
      // Em caso de erro crítico, usa os mocks
      const now = new Date().toISOString();
      const fallbackRoles = [
        { id: 'fallback-admin', name: 'Administrador (Fallback)', description: 'Acesso total ao sistema', created_at: now, updated_at: now },
        { id: 'fallback-teacher', name: 'Professor (Fallback)', description: 'Gerencia cursos e alunos', created_at: now, updated_at: now },
        { id: 'fallback-student', name: 'Estudante (Fallback)', description: 'Acessa os cursos e materiais', created_at: now, updated_at: now },
      ];
      const fallbackInstitutions = [
        { id: 'fallback-inst', name: 'Escola SaberCon (Fallback)', code: 'SABERCON_FALLBACK', created_at: now, updated_at: now },
      ];
      
      setRoles(fallbackRoles);
      setInstitutions(fallbackInstitutions);
      console.log('🆘 Usando dados de fallback');
    } finally {
      setAuxiliaryDataLoaded(true);
      console.log('🏁 Carregamento de dados auxiliares finalizado');
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

      console.log('🔍 Iniciando busca de usuários com parâmetros:', params);
      console.log('📊 Estado atual da paginação:', {
        currentPage,
        itemsPerPage,
        totalPages,
        totalItems,
        hasFilters: hasActiveFilters()
      });

      const response = searchTerm
        ? await userService.searchUsers(searchTerm, params)
        : await userService.getUsers(params);

      console.log('📥 Resposta recebida do userService:', {
        items: response.items?.length || 0,
        pagination: response.pagination,
        primeiroUsuario: response.items?.[0]?.name || 'Nenhum',
        ultimoUsuario: response.items?.[response.items?.length - 1]?.name || 'Nenhum'
      });

      // Verifica se a resposta tem a estrutura esperada
      if (!response || !response.items || !Array.isArray(response.items)) {
        console.error('❌ Resposta inválida do userService:', response);
        showError('Formato de resposta inválido do servidor');
        setUsers([]);
        setTotalPages(1);
        setTotalItems(0);
        return;
      }

      // Verifica se há informações de paginação
      if (!response.pagination) {
        console.warn('⚠️ Resposta sem informações de paginação');
        response.pagination = {
          page: currentPage,
          limit: itemsPerPage,
          total: response.items.length,
          totalPages: Math.ceil(response.items.length / itemsPerPage),
          hasNext: false,
          hasPrev: currentPage > 1
        };
      }

      const enrichedUsers = response.items.map(user => {
        const role = roles.find(r => r.id === user.role_id);
        const institution = institutions.find(i => i.id === user.institution_id);
        
        const enrichedUser = {
          ...user,
          role_name: (user as ExtendedUserResponseDto).role_name || role?.name || 'Não definida',
          institution_name: (user as ExtendedUserResponseDto).institution_name || institution?.name || 'Não vinculada',
        } as ExtendedUserResponseDto;

        return enrichedUser;
      });

      console.log('📊 Dados processados:', {
        totalUsuarios: enrichedUsers.length,
        paginaAtual: response.pagination.page,
        totalPaginas: response.pagination.totalPages,
        totalItens: response.pagination.total,
        temProxima: response.pagination.hasNext,
        temAnterior: response.pagination.hasPrev
      });

      setUsers(enrichedUsers);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);

      // Log de sucesso
      if (enrichedUsers.length > 0) {
        console.log(`✅ ${enrichedUsers.length} usuários carregados com sucesso (página ${response.pagination.page} de ${response.pagination.totalPages})`);
      } else {
        console.warn('⚠️ Nenhum usuário encontrado com os filtros aplicados');
      }

    } catch (error: any) {
      console.error('❌ Erro ao carregar usuários:', error);
      console.error('Stack trace:', error.stack);
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao carregar usuários';
      if (error.message) {
        if (error.message.includes('Network')) {
          errorMessage = 'Erro de conexão com o servidor. Verifique se o backend está rodando.';
        } else if (error.message.includes('401') || error.message.includes('403')) {
          errorMessage = 'Erro de autenticação. Faça login novamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Contate o suporte.';
        } else {
          errorMessage = error.message;
        }
      }
      
      showError(errorMessage);
      
      // Em caso de erro, limpa a lista para evitar exibir dados incorretos
      setUsers([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, searchTerm, filters, sortBy, sortOrder, itemsPerPage, roles, institutions, showError]);


  // Verificar conexão com o backend
  const checkBackendConnection = async () => {
    try {
      setConnectionStatus('checking');
      console.log('🔌 Verificando conexão com o backend...');
      // Faz uma chamada simples para verificar se o backend está respondendo
      const testResponse = await userService.getUsers({ limit: 1 });
      console.log('✅ Backend conectado com sucesso');
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com o backend:', error);
      setConnectionStatus('error');
      showError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      return false;
    }
  };

  useEffect(() => {
    // Primeiro verifica a conexão, depois carrega os dados auxiliares
    checkBackendConnection().then(isConnected => {
      if (isConnected) {
        loadAuxiliaryData();
      }
    });
  }, []);

  useEffect(() => {
    if (auxiliaryDataLoaded) {
      console.log('🔄 Dados auxiliares carregados, iniciando carregamento de usuários...');
      loadUsers();
    }
  }, [loadUsers, auxiliaryDataLoaded]);

  // Recarregar dados quando filtros, página ou ordenação mudarem
  useEffect(() => {
    if (auxiliaryDataLoaded) {
      console.log('🔄 Filtros/paginação alterados, recarregando usuários...', {
        currentPage,
        hasFilters: hasActiveFilters(),
        filters: Object.keys(filters),
        searchTerm: searchTerm || 'nenhum'
      });
      loadUsers();
    } else {
      console.log('⏳ Aguardando dados auxiliares para aplicar filtros...');
    }
  }, [currentPage, filters, sortBy, sortOrder, searchTerm, auxiliaryDataLoaded, loadUsers]);

  // Função de busca
  const handleSearch = useCallback((query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
  }, [])

  // Função para atualizar lista
  const handleRefresh = () => {
    setRefreshing(true)
    loadUsers(false)
  }

  // Criar novo usuário
  const handleCreateUser = () => {
    // Verificar se o usuário tem permissão
    if (!user) {
      showError('Você precisa estar logado para criar usuários.')
      return
    }
    
    // Verificar role do usuário
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'SCHOOL_MANAGER', 'admin']
    const userRole = user.role?.toUpperCase()
    
    console.log('🔐 Verificação de permissões:', {
      userRole,
      allowedRoles,
      hasPermission: allowedRoles.includes(userRole || '')
    })
    
    if (!allowedRoles.includes(userRole || '')) {
      showError(`Você não tem permissão para criar usuários. Sua função atual é: ${user.role}. Entre em contato com o administrador.`)
      return
    }
    
    setShowCreateModal(true)
  }

  const handleCreateUserSuccess = () => {
    loadUsers() // Recarrega a lista de usuários
    setShowCreateModal(false)
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

  // Função para atualizar um filtro específico com debounce
  const updateFilter = useCallback(
    debounce((key: string, value: any) => {
      console.log(`🔧 Atualizando filtro: ${key} = ${value}`);
      
      setCurrentPage(1); // Reset page to 1 when any filter changes
      setFilters(prev => {
        // Se o valor for vazio, remova a propriedade do objeto
        if (value === '' || value === undefined || value === null) {
          const newFilters = { ...prev }
          delete newFilters[key as keyof ExtendedUserFilterDto]
          console.log(`🗑️ Removendo filtro ${key}. Filtros restantes:`, Object.keys(newFilters));
          return newFilters
        }
        
        // Caso contrário, atualize com o novo valor
        const newFilters = {
          ...prev,
          [key]: value
        };
        
        console.log(`✅ Filtro ${key} atualizado. Filtros ativos:`, Object.keys(newFilters));
        
        // Log específico para filtros de role e instituição
        if (key === 'role_id') {
          const roleName = roles.find(r => r.id === value)?.name || 'Desconhecida';
          console.log(`🎭 Filtro de role aplicado: ${roleName} (ID: ${value})`);
        }
        
        if (key === 'institution_id') {
          const institutionName = institutions.find(i => i.id === value)?.name || 'Desconhecida';
          console.log(`🏢 Filtro de instituição aplicado: ${institutionName} (ID: ${value})`);
        }
        
        return newFilters;
      })
    }, 500), // 500ms delay
    [roles, institutions]
  )


  // Aplicar filtros (agora automático com debounce)
  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1)
    setShowFilters(false)
    loadUsers()
  }, [loadUsers])


  // Limpar filtros com feedback visual
  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchTerm('')
    setCurrentPage(1)
    setSortBy('name')
    setSortOrder('asc')
    setShowFilters(false)
    
    // Feedback visual
    showSuccess('Filtros limpos com sucesso')
    
    // Recarrega a lista
    loadUsers()
  }, [loadUsers, showSuccess])

  // Função para mudar de página com tratamento de erro
  const handlePageChange = useCallback(async (page: number) => {
    try {
      setCurrentPage(page)
      // Rolagem suave para o topo da lista quando mudar de página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Erro ao mudar de página:', error);
      showError('Erro ao carregar a página. Tente novamente.');
    }
  }, [showError])


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

  const getRoleLabel = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
      case 'ADMINISTRADOR':
        return 'Administrador'
      case 'TEACHER':
      case 'PROFESSOR':
        return 'Professor'
      case 'STUDENT':
      case 'ALUNO':
      case 'ESTUDANTE':
        return 'Estudante'
      case 'COORDINATOR':
      case 'COORDENADOR':
      case 'ACADEMIC_COORDINATOR':
        return 'Coordenador'
      case 'INSTITUTION_MANAGER':
      case 'MANAGER':
      case 'GERENTE':
        return 'Gerente'
      case 'GUARDIAN':
      case 'RESPONSAVEL':
        return 'Responsável'
      default:
        return role || 'Não definida'
    }
  }

  // Função para traduzir roles nos badges
  const translateRole = (roleName: string) => {
    return getRoleLabel(roleName)
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
    const normalizedRole = role?.toUpperCase()
    switch (normalizedRole) {
      case 'SYSTEM_ADMIN':
      case 'ADMIN':
      case 'ADMINISTRADOR':
        return 'danger'
      case 'TEACHER':
      case 'PROFESSOR':
        return 'warning'
      case 'STUDENT':
      case 'ALUNO':
      case 'ESTUDANTE':
        return 'info'
      case 'COORDINATOR':
      case 'COORDENADOR':
      case 'ACADEMIC_COORDINATOR':
        return 'success'
      case 'INSTITUTION_MANAGER':
      case 'MANAGER':
      case 'GERENTE':
        return 'primary'
      case 'GUARDIAN':
      case 'RESPONSAVEL':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  const columns: CRUDColumn<ExtendedUserResponseDto>[] = [
    {
      key: 'name',
      label: 'Usuário',
      sortable: true,
      width: '260px',
      render: (value, user, index) => {
        if (!user) return '-'
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-slate-800 truncate">{user.name || 'Sem nome'}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <a href={`mailto:${user.email}`} className="text-blue-600 hover:text-blue-800 hover:underline truncate">
                  {user.email}
                </a>
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'role_name',
      label: 'Função',
      sortable: true,
      width: '120px',
      render: (value, user, index) => {
        if (!user) return '-'
        const roleName = user.role_name || 'Não definida'
        return (
          <Badge variant={getRoleBadgeVariant(roleName)} className="px-2 py-1 text-xs font-medium shadow-sm">
            {translateRole(roleName)}
          </Badge>
        )
      }
    },
    {
      key: 'institution_name',
      label: 'Instituição',
      sortable: true,
      width: '150px',
      render: (value, user, index) => {
        if (!user) return '-'
        const institutionName = user.institution_name || 'Não vinculada'
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-purple-500 flex-shrink-0" />
            <span className="text-slate-700 text-sm font-medium truncate" title={institutionName}>
              {institutionName}
            </span>
          </div>
        )
      }
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '90px',
      render: (value, user, index) => {
        if (!user) return '-'
        const isActive = user.is_active === true
        return (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            {isActive ? "Ativo" : "Inativo"}
          </div>
        )
      }
    },
    {
      key: 'created_at',
      label: 'Cadastro',
      sortable: true,
      width: '110px',
      render: (value, user, index) => {
        if (!user || !user.created_at) return '-'
        const date = new Date(user.created_at)
        const formattedDate = date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
        return (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-700" title={formatDate(user.created_at)}>
              {formattedDate}
            </span>
          </div>
        )
      }
    }
  ]

  // Definir ações personalizadas para o GenericCRUD (compactas)
  const customActions: CRUDAction<ExtendedUserResponseDto>[] = [
    {
      label: 'Ver',
      icon: <Eye className="h-3 w-3" />,
      onClick: handleViewUser,
      variant: 'ghost',
      className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 text-xs'
    },
    {
      label: 'Editar',
      icon: <Edit className="h-3 w-3" />,
      onClick: handleEditUser,
      variant: 'ghost',
      className: 'text-amber-600 hover:text-amber-800 hover:bg-amber-50 px-2 py-1 text-xs'
    },
    {
      label: 'Senha',
      icon: <Key className="h-3 w-3" />,
      onClick: handleResetPassword,
      variant: 'ghost',
      className: 'text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-2 py-1 text-xs'
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
            <h1 className="text-2xl font-bold text-slate-800">Gerenciamento de Usuários</h1>
            <div className="flex items-center gap-2">
              {/* Indicador de status de conexão */}
              {connectionStatus === 'checking' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  <div className="animate-spin w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full"></div>
                  <span>Conectando...</span>
                </div>
              )}
              {connectionStatus === 'error' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Offline</span>
                </div>
              )}
              {connectionStatus === 'connected' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>Online</span>
                </div>
              )}
              
              <span className="text-sm text-slate-500">
                Total: {totalItems} usuários
              </span>
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-lg border border-slate-200 hover:bg-slate-50 ${refreshing ? 'animate-spin' : ''}`}
                title="Atualizar lista"
                disabled={connectionStatus === 'error'}
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
              <Button
                onClick={handleCreateUser}
                className="flex items-center gap-2"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                Novo Usuário
              </Button>
            </div>
          </div>
          

        </div>
        
        {/* Resumo dos filtros ativos */}
        {!showFilters && hasActiveFilters() && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-blue-800">Filtros ativos:</span>
              {filters.name && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Nome: {filters.name}
                </span>
              )}
              {filters.email && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Email: {filters.email}
                </span>
              )}
              {filters.role_id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Função: {roles.find(r => r.id === filters.role_id)?.name || `ID: ${filters.role_id}`}
                </span>
              )}
              {filters.institution_id && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Instituição: {institutions.find(i => i.id === filters.institution_id)?.name || `ID: ${filters.institution_id}`}
                </span>
              )}
              {filters.is_active !== undefined && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  Status: {filters.is_active ? 'Ativo' : 'Inativo'}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Busca: &quot;{searchTerm}&quot;
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

        {/* Seção de filtros expostos */}
        {showFilters && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg shadow-sm">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-blue-800">Filtros Avançados</h2>
                  {!auxiliaryDataLoaded && (
                    <p className="text-sm text-blue-600 flex items-center gap-2">
                      <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      Carregando opções de filtro...
                    </p>
                  )}
                </div>
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
                {/* Debug button - remover em produção */}
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      console.log('🔍 DEBUG - Estado atual:', {
                        auxiliaryDataLoaded,
                        roles: {
                          count: roles.length,
                          items: roles.map(r => ({ id: r.id, name: r.name }))
                        },
                        institutions: {
                          count: institutions.length,
                          items: institutions.map(i => ({ id: i.id, name: i.name, code: i.code }))
                        },
                        filters,
                        users: users.length,
                        totalItems,
                        currentPage,
                        totalPages,
                        connectionStatus
                      });
                      
                      // Testa o carregamento novamente
                      console.log('🔄 Recarregando dados auxiliares...');
                      loadAuxiliaryData();
                    }}
                    className="flex items-center gap-2 bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
                  >
                    🐛 Debug & Reload
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
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {roles.length} disponíveis
                  </span>
                </label>
                {!auxiliaryDataLoaded ? (
                  <FilterLoading />
                ) : (
                  <select
                    value={filters.role_id || ''}
                    onChange={(e) => {
                      console.log('🎭 Selecionando role:', e.target.value);
                      updateFilter('role_id', e.target.value);
                    }}
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="">🔍 Todas as funções ({roles.length})</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        👤 {role.name} {role.description && `- ${role.description}`}
                      </option>
                    ))}
                  </select>
                )}
                {auxiliaryDataLoaded && roles.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Nenhuma função disponível
                  </div>
                )}
                {auxiliaryDataLoaded && roles.length > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ {roles.length} funções carregadas
                  </div>
                )}
              </div>

              {/* Filtro por Instituição */}
              <div className="space-y-2 bg-white p-3 rounded-lg shadow-sm border border-blue-100">
                <label className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Building2 className="h-4 w-4 text-purple-500" />
                  Instituição
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {institutions.length} disponíveis
                  </span>
                </label>
                {!auxiliaryDataLoaded ? (
                  <FilterLoading />
                ) : (
                  <select
                    value={filters.institution_id || ''}
                    onChange={(e) => {
                      console.log('🏢 Selecionando instituição:', e.target.value);
                      updateFilter('institution_id', e.target.value);
                    }}
                    className="w-full rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    <option value="">🔍 Todas as instituições ({institutions.length})</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        🏢 {institution.name} {institution.code && `(${institution.code})`}
                      </option>
                    ))}
                  </select>
                )}
                {auxiliaryDataLoaded && institutions.length === 0 && (
                  <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                    ⚠️ Nenhuma instituição disponível
                  </div>
                )}
                {auxiliaryDataLoaded && institutions.length > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✅ {institutions.length} instituições carregadas
                  </div>
                )}
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
        
        {loading && users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary-DEFAULT border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-600">Carregando usuários...</p>
              <p className="mt-2 text-sm text-slate-500">
                {connectionStatus === 'checking' ? 'Conectando ao servidor...' : 'Buscando dados...'}
              </p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            onClearFilters={handleClearFilters}
            onCreateUser={handleCreateUser}
            hasFilters={hasActiveFilters()}
          />
        ) : (
          <>
            {/* Indicador de carregamento quando há dados */}
            {loading && users.length > 0 && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm font-medium">Atualizando dados...</span>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[780px]" style={{ fontSize: '0.875rem' }}>
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
                    onEdit={handleEditUser}
                    onDelete={handleDeleteUser}
                    onView={handleViewUser}
                    customActions={customActions}
                    showSearch={false}
                    showPagination={false}
                    showActions={true}
                    emptyMessage=""
                  />
                </div>
              </div>
            </div>
            
            {/* Paginação customizada */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
              {/* Informações e controles */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b border-slate-200">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-600">Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="text-sm border rounded px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-primary-DEFAULT"
                    disabled={loading}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                <div className="text-sm text-slate-600">
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-primary-DEFAULT border-t-transparent rounded-full"></div>
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    <span>
                      Exibindo {users.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} usuários
                      {hasActiveFilters() && (
                        <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          Filtrado
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Controles de paginação */}
              {totalPages > 1 && (
                <div className="p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </>
        )}
      
        {/* Modal de Edição de Usuário */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">✏️ Editar Usuário</h2>
                    <p className="text-orange-100 text-sm mt-1">Atualize os dados de {selectedUser.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-white hover:text-orange-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form 
                                 onSubmit={(e) => {
                   e.preventDefault();
                   showSuccess('Usuário atualizado com sucesso!');
                   setShowModal(false);
                   setSelectedUser(null);
                   loadUsers();
                 }}
                className="p-6 space-y-6"
              >
                {/* Informações Básicas */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Informações Básicas
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        defaultValue={selectedUser.name}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Digite o nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        defaultValue={selectedUser.email}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="usuario@exemplo.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Senha (opcional para edição) */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Key className="h-5 w-5 text-green-500" />
                    Alterar Senha (Opcional)
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">Deixe em branco para manter a senha atual</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Nova senha (opcional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </div>
                </div>

                {/* Função e Instituição */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Função e Instituição
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Função *
                      </label>
                      <select
                        required
                        defaultValue={selectedUser.role_id}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Selecione uma função</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Instituição
                      </label>
                      <select 
                        defaultValue={selectedUser.institution_id || ''}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Selecione uma instituição</option>
                        {institutions.map((institution) => (
                          <option key={institution.id} value={institution.id}>
                            {institution.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    Status do Usuário
                  </h3>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      defaultChecked={selectedUser.is_active}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                      Usuário ativo no sistema
                    </label>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Atualizar Usuário
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Detalhes do Usuário */}
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                      <p className="text-blue-100">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="text-white hover:text-blue-200 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Pessoais */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Informações Pessoais
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="h-4 w-4" />
                        <span>{selectedUser.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>Cadastrado em: {formatDate(selectedUser.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Informações do Sistema */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-500" />
                      Informações do Sistema
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Shield className="h-4 w-4" />
                        <span>Função: {selectedUser.role_name || 'Não definida'}</span>
                      </div>
                      {selectedUser.institution_name && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="h-4 w-4" />
                          <span>Instituição: {selectedUser.institution_name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {selectedUser.is_active ? (
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

                {/* Estatísticas */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    Estatísticas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">0</div>
                      <div className="text-sm text-slate-600">Cursos</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">0</div>
                      <div className="text-sm text-slate-600">Atividades</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">0</div>
                      <div className="text-sm text-slate-600">Certificados</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">0h</div>
                      <div className="text-sm text-slate-600">Tempo Total</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer com ações */}
              <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 rounded-b-lg">
                <div className="flex flex-wrap justify-between items-center gap-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditUser(selectedUser);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleToggleStatus(selectedUser);
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedUser.is_active 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {selectedUser.is_active ? (
                        <>
                          <UserX className="h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleResetPassword(selectedUser);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      <Key className="h-4 w-4" />
                      Resetar Senha
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Modal de Criação de Usuário */}
        {showCreateModal && (
          <div className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <CreateUserForm
              onClose={() => setShowCreateModal(false)}
              onSuccess={handleCreateUserSuccess}
              roles={roles}
              institutions={institutions}
            />
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}

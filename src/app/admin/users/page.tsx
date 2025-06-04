'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { UserForm } from '@/components/users/UserForm';
import { userService, User, type UserFilters } from '@/services/userService';
import { toast } from 'react-hot-toast';
import { 
  UsersIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Componente de Estatísticas
const StatsCard = ({ title, value, icon: Icon, color = 'blue' }: {
  title: string;
  value: number;
  icon: any;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    red: 'bg-red-50 border-red-200 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Componente de Filtros
const UserFilters = ({ filters, onFiltersChange }: {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    onFiltersChange({ ...filters, search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.role || ''}
          onChange={(e) => onFiltersChange({ ...filters, role: e.target.value })}
        >
          <option value="">Todos os papéis</option>
          <option value="admin">Administrador</option>
          <option value="user">Usuário</option>
          <option value="system_admin">Administrador do Sistema</option>
          <option value="teacher">Professor</option>
          <option value="student">Estudante</option>
        </Select>
        
        <Select
          value={filters.status || ''}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="blocked">Bloqueado</option>
        </Select>
      </div>
    </div>
  );
};

// Componente de Badge de Status
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    active: { label: 'Ativo', className: 'bg-green-100 text-green-800 border-green-200' },
    inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800 border-gray-200' },
    blocked: { label: 'Bloqueado', className: 'bg-red-100 text-red-800 border-red-200' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  );
};

// Componente de Ações da Tabela
const UserActions = ({ user, onEdit, onToggleStatus, onDelete }: {
  user: User;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) => (
  <div className="flex items-center gap-1">
    <Button
      variant="ghost"
      size="sm"
      onClick={onEdit}
      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
    >
      <PencilIcon className="w-4 h-4" />
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggleStatus}
      className={user.status === 'active' 
        ? "text-red-600 hover:text-red-800 hover:bg-red-50" 
        : "text-green-600 hover:text-green-800 hover:bg-green-50"
      }
    >
      {user.status === 'active' ? 
        <LockClosedIcon className="w-4 h-4" /> : 
        <LockOpenIcon className="w-4 h-4" />
      }
    </Button>
    <Button
      variant="ghost"
      size="sm"
      onClick={onDelete}
      className="text-red-600 hover:text-red-800 hover:bg-red-50"
    >
      <TrashIcon className="w-4 h-4" />
    </Button>
  </div>
);

// Estado de Loading
const LoadingState = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span className="ml-3 text-gray-600">Carregando usuários...</span>
    </div>
  </div>
);

// Estado Vazio
const EmptyState = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
    <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
    <p className="text-gray-500 mb-6">Tente ajustar os filtros ou criar um novo usuário.</p>
  </div>
);

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, new: 0, blocked: 0 });
  const [filters, setFilters] = useState<UserFilters>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();

  // Memoizar as funções para evitar re-renders desnecessários
  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUsers(filters);
      setUsers(response.users);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const response = await userService.getUserStats();
      setStats(response);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleCreateUser = async (data: Partial<User>) => {
    try {
      await userService.createUser(data);
      toast.success('Usuário criado com sucesso');
      setShowForm(false);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async (data: Partial<User>) => {
    if (!selectedUser) return;
    
    try {
      await userService.updateUser(selectedUser.id, data);
      toast.success('Usuário atualizado com sucesso');
      setShowForm(false);
      setSelectedUser(undefined);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await userService.deleteUser(id);
      toast.success('Usuário excluído com sucesso');
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    try {
      await userService.toggleUserStatus(id, newStatus as 'active' | 'blocked');
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'bloqueado'} com sucesso`);
      loadUsers();
      loadStats();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleFiltersChange = useCallback((newFilters: UserFilters) => {
    setFilters(newFilters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Usuários</h1>
            <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
          </div>
          <Button 
            onClick={() => {
              setSelectedUser(undefined);
              setShowForm(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Usuários"
            value={stats.total}
            icon={UsersIcon}
            color="blue"
          />
          <StatsCard
            title="Usuários Ativos"
            value={stats.active}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatsCard
            title="Novos Usuários"
            value={stats.new}
            icon={ClockIcon}
            color="yellow"
          />
          <StatsCard
            title="Usuários Bloqueados"
            value={stats.blocked}
            icon={XCircleIcon}
            color="red"
          />
        </div>

        {/* Filtros */}
        <UserFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {/* Tabela de Usuários */}
        {isLoading ? (
          <LoadingState />
        ) : users.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Papel
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instituição
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Acesso
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.institution || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastAccess ? new Date(user.lastAccess).toLocaleString('pt-BR') : 'Nunca'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserActions
                          user={user}
                          onEdit={() => {
                            setSelectedUser(user);
                            setShowForm(true);
                          }}
                          onToggleStatus={() => handleToggleStatus(user.id, user.status)}
                          onDelete={() => handleDeleteUser(user.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Formulário */}
        <Dialog
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedUser(undefined);
          }}
        >
          <div className="p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <UserForm
              user={selectedUser}
              onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
              onCancel={() => {
                setShowForm(false);
                setSelectedUser(undefined);
              }}
            />
          </div>
        </Dialog>
      </div>
    </div>
  );
}

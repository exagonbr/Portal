'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { 
  Send, 
  Eye, 
  Calendar, 
  Users, 
  Mail, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  Search,
  MoreVertical,
  Trash2,
  Edit,
  BarChart3
} from 'lucide-react';
import { notificationApiService } from '@/services/notificationApiService';

interface SentNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'sent' | 'pending' | 'failed' | 'scheduled';
  recipientCount: number;
  deliveredCount: number;
  readCount: number;
  sentAt: string;
  scheduledFor?: string;
  methods: {
    push: boolean;
    email: boolean;
  };
}

export default function SentNotificationsPage() {
  const [notifications, setNotifications] = useState<SentNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const statusOptions = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'sent', label: 'Enviadas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'failed', label: 'Falharam' },
    { value: 'scheduled', label: 'Agendadas' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'academic', label: 'Acadêmico' },
    { value: 'system', label: 'Sistema' },
    { value: 'social', label: 'Social' },
    { value: 'administrative', label: 'Administrativo' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Todos os Tipos' },
    { value: 'info', label: 'Informação' },
    { value: 'success', label: 'Sucesso' },
    { value: 'warning', label: 'Aviso' },
    { value: 'error', label: 'Erro' }
  ];

  useEffect(() => {
    loadSentNotifications();
  }, [filters]);

  const loadSentNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await notificationApiService.getSentNotifications({
        page: 1,
        limit: 50,
        status: filters.status !== 'all' ? filters.status : undefined
      });
      
      // Mock data para demonstração
      const mockNotifications: SentNotification[] = [
        {
          id: '1',
          title: 'Atualização do Sistema',
          message: 'O sistema será atualizado na próxima segunda-feira às 02:00.',
          type: 'info',
          category: 'system',
          priority: 'high',
          status: 'sent',
          recipientCount: 150,
          deliveredCount: 145,
          readCount: 120,
          sentAt: '2024-01-15T10:30:00Z',
          methods: { push: true, email: true }
        },
        {
          id: '2',
          title: 'Nova Funcionalidade Disponível',
          message: 'Agora você pode exportar relatórios em PDF diretamente do painel.',
          type: 'success',
          category: 'system',
          priority: 'medium',
          status: 'sent',
          recipientCount: 85,
          deliveredCount: 82,
          readCount: 65,
          sentAt: '2024-01-14T14:15:00Z',
          methods: { push: true, email: false }
        },
        {
          id: '3',
          title: 'Reunião de Coordenação',
          message: 'Reunião agendada para discutir o planejamento do próximo semestre.',
          type: 'info',
          category: 'administrative',
          priority: 'medium',
          status: 'scheduled',
          recipientCount: 25,
          deliveredCount: 0,
          readCount: 0,
          sentAt: '2024-01-13T09:00:00Z',
          scheduledFor: '2024-01-20T15:00:00Z',
          methods: { push: true, email: true }
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações enviadas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falhou';
      case 'scheduled': return 'Agendada';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || notification.status === filters.status;
    const matchesCategory = filters.category === 'all' || notification.category === filters.category;
    const matchesType = filters.type === 'all' || notification.type === filters.type;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesType;
  });

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    );
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Notificações Enviadas</h1>
        <p className="text-gray-600">
          Gerencie e acompanhe suas notificações enviadas
        </p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar notificações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Select
              value={filters.status}
              onChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
              options={statusOptions}
              className="w-48"
            />
            
            <Select
              value={filters.category}
              onChange={(value: any) => setFilters(prev => ({ ...prev, category: value }))}
              options={categoryOptions}
              className="w-48"
            />
            
            <Select
              value={filters.type}
              onChange={(value: any) => setFilters(prev => ({ ...prev, type: value }))}
              options={typeOptions}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header da Tabela */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                onChange={selectAllNotifications}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedNotifications.length > 0 
                  ? `${selectedNotifications.length} selecionada(s)`
                  : `${filteredNotifications.length} notificação(ões)`
                }
              </span>
            </div>
            
            {selectedNotifications.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Excluir
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando notificações...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação encontrada</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleNotificationSelection(notification.id)}
                    className="mt-1 rounded border-gray-300"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {getStatusIcon(notification.status)}
                        {getStatusLabel(notification.status)}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        {notification.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {notification.recipientCount} destinatários
                        </span>
                        
                        {notification.status === 'sent' && (
                          <>
                            <span>
                              {notification.deliveredCount} entregues
                            </span>
                            <span>
                              {notification.readCount} lidas
                            </span>
                          </>
                        )}
                        
                        <div className="flex items-center gap-1">
                          {notification.methods.push && <Bell className="w-3 h-3" />}
                          {notification.methods.email && <Mail className="w-3 h-3" />}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {notification.status === 'scheduled' && notification.scheduledFor
                          ? `Agendada para ${formatDate(notification.scheduledFor)}`
                          : `Enviada em ${formatDate(notification.sentAt)}`
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

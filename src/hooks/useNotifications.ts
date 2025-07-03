'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Notification {
  id: number
  type: 'info' | 'warning' | 'success' | 'error'
  title: string
  message: string
  time: string
  date: string
  read: boolean
  category: 'academic' | 'system' | 'social' | 'administrative'
}

export interface NotificationFilters {
  category: string
  type: string
  status: string
  dateRange: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simular carregamento de notificações do backend
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true)
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockNotifications: Notification[] = [
          {
            id: 1,
            type: 'info',
            title: 'Nova Atividade Disponível',
            message: 'Nova atividade enviada em Matemática - Álgebra Linear',
            time: 'há 5 minutos',
            date: '2024-01-15',
            read: false,
            category: 'academic'
          },
          {
            id: 2,
            type: 'warning',
            title: 'Prazo Próximo',
            message: 'Prazo próximo: Relatório de Física - Mecânica Quântica',
            time: 'há 1 hora',
            date: '2024-01-15',
            read: false,
            category: 'academic'
          },
          {
            id: 3,
            type: 'success',
            title: 'Notas Disponíveis',
            message: 'Notas da última avaliação de Química disponíveis',
            time: 'há 2 horas',
            date: '2024-01-15',
            read: true,
            category: 'academic'
          },
          {
            id: 4,
            type: 'info',
            title: 'Atualização do Sistema',
            message: 'Nova versão do portal educacional disponível',
            time: 'há 3 horas',
            date: '2024-01-15',
            read: true,
            category: 'system'
          },
          {
            id: 5,
            type: 'success',
            title: 'Certificado Emitido',
            message: 'Certificado do curso de Programação Web emitido com sucesso',
            time: 'há 1 dia',
            date: '2024-01-14',
            read: false,
            category: 'academic'
          },
          {
            id: 6,
            type: 'warning',
            title: 'Manutenção Programada',
            message: 'Manutenção do sistema programada para domingo às 02:00',
            time: 'há 2 dias',
            date: '2024-01-13',
            read: true,
            category: 'system'
          },
          {
            id: 7,
            type: 'info',
            title: 'Nova Mensagem no Fórum',
            message: 'Você recebeu uma nova mensagem no fórum de discussão',
            time: 'há 3 dias',
            date: '2024-01-12',
            read: false,
            category: 'social'
          },
          {
            id: 8,
            type: 'error',
            title: 'Erro no Upload',
            message: 'Falha ao fazer upload do arquivo. Tente novamente.',
            time: 'há 4 dias',
            date: '2024-01-11',
            read: true,
            category: 'system'
          },
          {
            id: 9,
            type: 'info',
            title: 'Reunião Agendada',
            message: 'Reunião de coordenação agendada para quinta-feira às 14:00',
            time: 'há 5 dias',
            date: '2024-01-10',
            read: false,
            category: 'administrative'
          },
          {
            id: 10,
            type: 'success',
            title: 'Pagamento Confirmado',
            message: 'Pagamento da mensalidade confirmado com sucesso',
            time: 'há 1 semana',
            date: '2024-01-08',
            read: true,
            category: 'administrative'
          }
        ]
        
        setNotifications(mockNotifications)
        setError(null)
      } catch (err) {
        setError('Erro ao carregar notificações')
        console.error('Erro ao carregar notificações:', err)
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  const markAsRead = useCallback((notificationId: number) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const markMultipleAsRead = useCallback((notificationIds: number[]) => {
    setNotifications(prev => 
      prev.map(n => 
        notificationIds.includes(n.id) ? { ...n, read: true } : n
      )
    )
  }, [])

  const deleteNotifications = useCallback((notificationIds: number[]) => {
    setNotifications(prev => 
      prev.filter(n => !notificationIds.includes(n.id))
    )
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now() // Simples gerador de ID
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const getFilteredNotifications = useCallback((
    filters: NotificationFilters,
    searchTerm: string = ''
  ) => {
    let filtered = notifications

    // Filtro por categoria
    if (filters.category !== 'all') {
      filtered = filtered.filter(n => n.category === filters.category)
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type)
    }

    // Filtro por status
    if (filters.status !== 'all') {
      if (filters.status === 'read') {
        filtered = filtered.filter(n => n.read)
      } else if (filters.status === 'unread') {
        filtered = filtered.filter(n => !n.read)
      }
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length
  const totalCount = notifications.length

  return {
    notifications,
    loading,
    error,
    unreadCount,
    totalCount,
    markAsRead,
    markAllAsRead,
    markMultipleAsRead,
    deleteNotifications,
    addNotification,
    getFilteredNotifications,
    refetch: () => {
      // Implementar refetch se necessário
    }
  }
}
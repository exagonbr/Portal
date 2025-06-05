'use client';

import { useAuth } from '../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { UserRole } from '../types/auth';
import { ROLE_LABELS } from '@/types/roles';

interface StandardHeaderProps {
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: { label: string; href?: string }[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'assignment' | 'exam' | 'class' | 'event';
  status: 'pending' | 'completed' | 'overdue';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'class' | 'exam' | 'meeting' | 'event';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

const getRoleLabel = (role: UserRole): string => {
  const roleLabels: Record<UserRole, string> = {
    'student': 'Aluno',
    'teacher': 'Professor',
    'manager': 'Gestor',
    'institution_manager': 'Gestor Institucional',
    'admin': 'Administrador',
    'system_admin': 'Administrador do Sistema',
    'academic_coordinator': 'Coordenador Acadêmico',
    'guardian': 'Responsável'
  };
  return roleLabels[role] || role;
};

const StandardHeader = ({ 
  title = "Portal Educacional",
  subtitle,
  showBreadcrumb = false,
  breadcrumbItems = []
}: StandardHeaderProps) => {
  const { user, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isActivitiesMenuOpen, setIsActivitiesMenuOpen] = useState(false);
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [isNotificationsMenuOpen, setIsNotificationsMenuOpen] = useState(false);
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const activitiesMenuRef = useRef<HTMLDivElement>(null);
  const calendarMenuRef = useRef<HTMLDivElement>(null);
  const notificationsMenuRef = useRef<HTMLDivElement>(null);

  // Estados para dados mockados
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      title: 'Entrega do Projeto Final',
      description: 'Desenvolvimento de aplicação web',
      date: '2024-01-15',
      type: 'assignment',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Prova de Matemática',
      description: 'Avaliação do 3º bimestre',
      date: '2024-01-18',
      type: 'exam',
      status: 'pending'
    },
    {
      id: '3',
      title: 'Apresentação TCC',
      description: 'Defesa do trabalho de conclusão',
      date: '2024-01-12',
      type: 'assignment',
      status: 'completed'
    }
  ]);

  const [calendarEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Aula de Programação',
      date: '2024-01-15',
      time: '08:00',
      type: 'class'
    },
    {
      id: '2',
      title: 'Reunião de Orientação',
      date: '2024-01-15',
      time: '14:00',
      type: 'meeting'
    },
    {
      id: '3',
      title: 'Seminário de Tecnologia',
      date: '2024-01-16',
      time: '10:00',
      type: 'event'
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova Atividade Disponível',
      message: 'Projeto Final foi adicionado à disciplina de Programação Web',
      type: 'info',
      timestamp: '2024-01-14T10:30:00Z',
      read: false
    },
    {
      id: '2',
      title: 'Prazo Próximo',
      message: 'Entrega do relatório vence em 2 dias',
      type: 'warning',
      timestamp: '2024-01-14T09:15:00Z',
      read: false
    },
    {
      id: '3',
      title: 'Nota Publicada',
      message: 'Sua nota da prova de História foi publicada',
      type: 'success',
      timestamp: '2024-01-13T16:45:00Z',
      read: true
    }
  ]);

  // Função para solicitar permissão de notificações push
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações push");
      return;
    }

    if (Notification.permission === "granted") {
      return;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Permissão para notificações concedida");
      }
    }
  };

  // Função para enviar notificação push
  const sendPushNotification = (title: string, message: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  };

  // Solicitar permissão ao carregar o componente
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (activitiesMenuRef.current && !activitiesMenuRef.current.contains(event.target as Node)) {
        setIsActivitiesMenuOpen(false);
      }
      if (calendarMenuRef.current && !calendarMenuRef.current.contains(event.target as Node)) {
        setIsCalendarMenuOpen(false);
      }
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target as Node)) {
        setIsNotificationsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const todayEvents = calendarEvents.filter(e => e.date === new Date().toISOString().split('T')[0]).length;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'assignment':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'exam':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'class':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  const getCalendarIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'class':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
            </svg>
          </div>
        );
      case 'exam':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'meeting':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm backdrop-blur-sm relative z-[50]">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex-1">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-0.5">{subtitle}</p>
            )}
            {showBreadcrumb && breadcrumbItems.length > 0 && (
              <nav className="flex mt-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm">
                  {breadcrumbItems.map((item, index) => (
                    <li key={index} className="flex items-center">
                      {index > 0 && (
                        <svg className="w-4 h-4 text-slate-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {item.href ? (
                        <Link href={item.href} className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-slate-500 font-medium">{item.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </div>

        {/* Right Section - Actions and User Menu */}
        <div className="flex items-center space-x-4">

          {/* Activities */}
          <div className="relative" ref={activitiesMenuRef}>
            <button
              onClick={() => setIsActivitiesMenuOpen(!isActivitiesMenuOpen)}
              className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:text-slate-700 transition-all duration-200 rounded-xl"
            >
              <span className="sr-only">Atividades</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              {pendingActivities > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {pendingActivities > 9 ? '9+' : pendingActivities}
                </span>
              )}
            </button>

            {/* Activities Dropdown */}
            {isActivitiesMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[9999] animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Atividades</h3>
                  <p className="text-xs text-slate-600">{pendingActivities} pendentes</p>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        {getActivityIcon(activity.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-800 truncate">{activity.title}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {activity.status === 'pending' ? 'Pendente' :
                               activity.status === 'completed' ? 'Concluída' : 'Atrasada'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">Prazo: {formatDate(activity.date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-slate-100">
                  <Link
                    href="/activities"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setIsActivitiesMenuOpen(false)}
                  >
                    Ver todas as atividades
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Calendar */}
          <div className="relative" ref={calendarMenuRef}>
            <button
              onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
              className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:text-slate-700 transition-all duration-200 rounded-xl"
            >
              <span className="sr-only">Calendário</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {todayEvents > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {todayEvents > 9 ? '9+' : todayEvents}
                </span>
              )}
            </button>

            {/* Calendar Dropdown */}
            {isCalendarMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[9999] animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">Calendário</h3>
                  <p className="text-xs text-slate-600">Próximos eventos</p>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {calendarEvents.map((event) => (
                    <div key={event.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        {getCalendarIcon(event.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{event.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-slate-600">{formatDate(event.date)}</p>
                            <span className="text-xs text-slate-400">•</span>
                            <p className="text-xs text-slate-600">{event.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-slate-100">
                  <Link
                    href="/calendar"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setIsCalendarMenuOpen(false)}
                  >
                    Ver calendário completo
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsMenuRef}>
            <button
              onClick={() => setIsNotificationsMenuOpen(!isNotificationsMenuOpen)}
              className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:text-slate-700 transition-all duration-200 rounded-xl"
            >
              <span className="sr-only">Notificações</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM15 17H9a4 4 0 01-4-4V5a4 4 0 014-4h6a4 4 0 014 4v8a4 4 0 01-4 4z" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 block h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsMenuOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[9999] animate-scale-in">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Notificações</h3>
                    <p className="text-xs text-slate-600">{unreadNotifications} não lidas</p>
                  </div>
                  {user?.role !== 'student' && (
                    <Link
                      href="/notifications/send"
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Enviar Nova
                    </Link>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 cursor-pointer ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-slate-500 mt-1">{formatTime(notification.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 border-t border-slate-100">
                  <Link
                    href="/notifications"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setIsNotificationsMenuOpen(false)}
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          {user && (
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-100 focus:outline-none focus:bg-slate-100 transition-all duration-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-600">
                  {getRoleLabel(user?.role) && ROLE_LABELS[user.role as UserRole]}
                  </p>
                </div>
                <svg 
                  className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-[9999] animate-scale-in">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {getRoleLabel(user?.role) && ROLE_LABELS[user.role as UserRole]}
                    </span>
                  </div>
                  
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    <svg className="mr-3 h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">Meu Perfil</span>
                  </Link>

                  <hr className="my-2 border-slate-100" />
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="mr-3 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default StandardHeader; 
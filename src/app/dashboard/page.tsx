'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StandardTable from '@/components/ui/StandardTable';

interface RecentActivity {
  id: number;
  title: string;
  type: string;
  status: string;
  lastActivity: string;
  progress: string;
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      courses: 0,
      activities: 0,
      completedActivities: 0,
      totalStudents: 0
    },
    recentActivities: [] as RecentActivity[],
    loading: true
  });

  useEffect(() => {
    // Simular carregamento de dados
    const loadDashboardData = async () => {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dados simulados baseados no tipo de usuário
      const mockData = {
        stats: {
          courses: 12,
          activities: 45,
          completedActivities: 38,
          totalStudents: user?.role === 'teacher' ? 156 : 1
        },
        recentActivities: [
          {
            id: 1,
            title: 'Matemática Básica',
            type: 'Curso',
            status: 'Ativo',
            lastActivity: '2024-01-15',
            progress: '85%'
          },
          {
            id: 2,
            title: 'Avaliação Final',
            type: 'Atividade',
            status: 'Pendente',
            lastActivity: '2024-01-14',
            progress: '0%'
          },
          {
            id: 3,
            title: 'Projeto Integrador',
            type: 'Projeto',
            status: 'Em Progresso',
            lastActivity: '2024-01-13',
            progress: '60%'
          }
        ],
        loading: false
      };

      setDashboardData(mockData);
    };

    loadDashboardData();
  }, [user?.role]);

  const getStatCards = () => {
    const { stats } = dashboardData;
    
    if (user?.role === 'student') {
      return [
        {
          title: 'Cursos Matriculados',
          value: stats.courses,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          color: 'blue',
          change: { value: 8, trend: 'up' as const, period: 'desde o último mês' }
        },
        {
          title: 'Atividades Pendentes',
          value: stats.activities - stats.completedActivities,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          color: 'yellow'
        },
        {
          title: 'Atividades Concluídas',
          value: stats.completedActivities,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'green',
          change: { value: 12, trend: 'up' as const, period: 'esta semana' }
        },
        {
          title: 'Taxa de Conclusão',
          value: `${Math.round((stats.completedActivities / stats.activities) * 100)}%`,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ),
          color: 'purple',
          change: { value: 5, trend: 'up' as const, period: 'este mês' }
        }
      ];
    }

    // Para professores e outros roles
    return [
      {
        title: 'Total de Estudantes',
        value: stats.totalStudents,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        ),
        color: 'blue',
        change: { value: 12, trend: 'up' as const, period: 'desde o último mês' }
      },
      {
        title: 'Cursos Ativos',
        value: stats.courses,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        color: 'green'
      },
      {
        title: 'Atividades Criadas',
        value: stats.activities,
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
        color: 'purple'
      },
      {
        title: 'Taxa de Engajamento',
        value: '87%',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        color: 'indigo',
        change: { value: 3, trend: 'up' as const, period: 'esta semana' }
      }
    ];
  };

  const tableColumns = [
    {
      key: 'title',
      title: 'Título',
      sortable: true
    },
    {
      key: 'type',
      title: 'Tipo',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Curso' ? 'bg-blue-100 text-blue-800' :
          value === 'Atividade' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Ativo' ? 'bg-green-100 text-green-800' :
          value === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'lastActivity',
      title: 'Última Atividade',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString('pt-BR')
    },
    {
      key: 'progress',
      title: 'Progresso',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: value }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      )
    }
  ];

  const getRightSidebarContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Atividade Recente</h3>
        <div className="space-y-3">
          {[
            { user: 'Ana Silva', action: 'concluiu', target: 'Matemática Básica', time: '2 horas atrás' },
            { user: 'Carlos Santos', action: 'iniciou', target: 'Física Moderna', time: '4 horas atrás' },
            { user: 'Maria Oliveira', action: 'enviou', target: 'Projeto Final', time: '6 horas atrás' }
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {activity.user.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Próximos Eventos</h3>
        <div className="space-y-3">
          {[
            { title: 'Reunião de Pais', date: 'Hoje, 15:00', type: 'meeting' },
            { title: 'Avaliação Final', date: 'Amanhã, 09:00', type: 'exam' },
            { title: 'Workshop de Inovação', date: 'Sex, 14:00', type: 'workshop' }
          ].map((event, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-3">
              <p className="font-medium text-sm">{event.title}</p>
              <p className="text-xs text-gray-500">{event.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Greeting Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
        </h1>
        <p className="text-blue-100 mt-2 text-lg">
          Bem-vindo de volta ao Portal Educacional
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
            change={stat.change}
          />
        ))}
      </div>

      {/* Recent Activities Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">
            {user?.role === 'student' ? 'Minhas Atividades' : 'Atividades Recentes'}
          </h2>
          <div className="flex space-x-2">
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>Esta semana</option>
              <option>Este mês</option>
              <option>Todos</option>
            </select>
          </div>
        </div>

        <StandardTable
          columns={tableColumns}
          data={dashboardData.recentActivities}
          loading={dashboardData.loading}
          actions={{
            title: 'Ações',
            render: (record) => (
              <div className="flex space-x-2">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Ver
                </button>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  Continuar
                </button>
              </div>
            )
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Novo Curso', icon: '📚', href: '/courses/new' },
          { title: 'Nova Atividade', icon: '📝', href: '/assignments/new' },
          { title: 'Relatórios', icon: '📊', href: '/reports' },
          { title: 'Configurações', icon: '⚙️', href: '/settings' }
        ].map((action, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-sm font-medium text-gray-700">{action.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

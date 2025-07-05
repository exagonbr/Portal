'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import SimpleChart from '@/components/ui/SimpleChart';
import ModernTable from '@/components/ui/ModernTable';

interface DashboardStats {
  totalRevenue: string;
  growth: string;
  students: number;
  courses: number;
  completion: string;
}

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success';
}

export default function ModernDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: '465,560',
    growth: '150%',
    students: 1250,
    courses: 45,
    completion: '87%'
  });

  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      user: 'Ana Silva',
      action: 'concluiu o curso de Matemática',
      time: '2 min atrás',
      avatar: 'AS'
    },
    {
      id: '2',
      user: 'Carlos Santos',
      action: 'iniciou nova atividade',
      time: '5 min atrás',
      avatar: 'CS'
    },
    {
      id: '3',
      user: 'Maria Oliveira',
      action: 'enviou projeto final',
      time: '10 min atrás',
      avatar: 'MO'
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Nova Mensagem',
      message: 'Você tem 3 novas mensagens',
      time: 'Agora',
      type: 'info'
    },
    {
      id: '2',
      title: 'Prazo Próximo',
      message: 'Entrega do projeto em 2 dias',
      time: '1h atrás',
      type: 'warning'
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-gray-600">
                Bem-vindo de volta ao seu painel de controle
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Novo Curso
              </button>
              <div className="relative">
                <button className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7H4l5-5v5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {/* Revenue Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +12%
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Faturamento</h3>
                <p className="text-2xl font-bold text-gray-800">R$ {stats.totalRevenue}</p>
                <p className="text-xs text-gray-500 mt-1">vs mês anterior</p>
              </div>

              {/* Students Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    +8%
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Estudantes</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.students.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">ativos este mês</p>
              </div>

              {/* Courses Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    +5
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">Cursos</h3>
                <p className="text-2xl font-bold text-gray-800">{stats.courses}</p>
                <p className="text-xs text-gray-500 mt-1">disponíveis</p>
              </div>
            </motion.div>

                         {/* Chart Section */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
               <SimpleChart
                 title="Crescimento Mensal"
                 data={[
                   { label: 'Jan', value: 40 },
                   { label: 'Fev', value: 65 },
                   { label: 'Mar', value: 45 },
                   { label: 'Abr', value: 80 },
                   { label: 'Mai', value: 60 },
                   { label: 'Jun', value: 95 },
                   { label: 'Jul', value: 75 }
                 ]}
                 height={280}
                 animated={true}
               />
             </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { title: 'Criar Curso', icon: '📚', color: 'blue' },
                { title: 'Nova Turma', icon: '👥', color: 'green' },
                { title: 'Relatórios', icon: '📊', color: 'purple' },
                { title: 'Configurações', icon: '⚙️', color: 'orange' }
              ].map((action, index) => (
                <button
                  key={index}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1 group"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <p className="text-sm font-medium text-gray-700">{action.title}</p>
                  </div>
                </button>
                             ))}
             </motion.div>

             {/* Recent Activities Table */}
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
             >
               <ModernTable
                 title="Atividades Recentes"
                 searchable={true}
                 pagination={true}
                 pageSize={5}
                 columns={[
                   {
                     key: 'student',
                     title: 'Estudante',
                     sortable: true,
                     render: (value, record) => (
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                           <span className="text-white text-xs font-medium">
                             {value.charAt(0)}
                           </span>
                         </div>
                         <span className="font-medium">{value}</span>
                       </div>
                     )
                   },
                   {
                     key: 'course',
                     title: 'Curso',
                     sortable: true
                   },
                   {
                     key: 'activity',
                     title: 'Atividade',
                     sortable: true
                   },
                   {
                     key: 'status',
                     title: 'Status',
                     render: (value) => (
                       <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                         value === 'Concluído' ? 'bg-green-100 text-green-800' :
                         value === 'Em Progresso' ? 'bg-blue-100 text-blue-800' :
                         'bg-yellow-100 text-yellow-800'
                       }`}>
                         {value}
                       </span>
                     )
                   },
                   {
                     key: 'progress',
                     title: 'Progresso',
                     render: (value) => (
                       <div className="flex items-center space-x-2">
                         <div className="w-16 bg-gray-200 rounded-full h-2">
                           <div 
                             className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                             style={{ width: `${value}%` }}
                           ></div>
                         </div>
                         <span className="text-sm text-gray-600">{value}%</span>
                       </div>
                     )
                   },
                   {
                     key: 'date',
                     title: 'Data',
                     sortable: true,
                     render: (value) => new Date(value).toLocaleDateString('pt-BR')
                   }
                 ]}
                 data={[
                   {
                     student: 'Ana Silva',
                     course: 'Matemática Básica',
                     activity: 'Exercícios Cap. 1',
                     status: 'Concluído',
                     progress: 100,
                     date: '2024-01-15'
                   },
                   {
                     student: 'Carlos Santos',
                     course: 'Física Moderna',
                     activity: 'Laboratório Virtual',
                     status: 'Em Progresso',
                     progress: 75,
                     date: '2024-01-14'
                   },
                   {
                     student: 'Maria Oliveira',
                     course: 'Química Orgânica',
                     activity: 'Projeto Final',
                     status: 'Pendente',
                     progress: 30,
                     date: '2024-01-13'
                   },
                   {
                     student: 'João Pedro',
                     course: 'História do Brasil',
                     activity: 'Ensaio Histórico',
                     status: 'Em Progresso',
                     progress: 60,
                     date: '2024-01-12'
                   },
                   {
                     student: 'Beatriz Costa',
                     course: 'Literatura Brasileira',
                     activity: 'Análise Literária',
                     status: 'Concluído',
                     progress: 100,
                     date: '2024-01-11'
                   }
                 ]}
               />
             </motion.div>
           </div>
 
           {/* Right Column - Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Atividade Recente</h3>
                <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                  Ver todas
                </button>
              </div>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {activity.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Notificações</h3>
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Taxa de Conclusão</h3>
                <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold mb-2">{stats.completion}</div>
              <p className="text-green-100 text-sm">dos estudantes completaram os cursos</p>
              <div className="mt-4 bg-white bg-opacity-20 rounded-full h-2">
                <div className="bg-white rounded-full h-2" style={{ width: stats.completion }}></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useEffect, useState, useMemo } from 'react';
import { User } from '../../../types/auth';
import * as authService from '../../../services/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboardPage() { // Renamed component for clarity
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not admin or manager
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      router.push('/dashboard'); // This will redirect to student/teacher specific dashboards
    }
  }, [user, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersList = await authService.listUsers();
        setUsers(usersList);
      } catch (err) {
        setError('Falha ao carregar usuários');
        console.error('Erro ao carregar usuários:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    try {
      const success = await authService.deleteUser(id);
      if (success) {
        setUsers(users.filter(user => user.id !== id));
      }
    } catch (err) {
        setError('Falha ao excluir usuário');
        console.error('Erro ao excluir usuário:', err);
    }
  };

  const roleCounts = useMemo(() => {
    const counts = { admin: 0, manager: 0, other: 0 };
    users.forEach(u => {
      if (u.role === 'admin') counts.admin++;
      else if (u.role === 'manager') counts.manager++;
      else counts.other++;
    });
    return counts;
  }, [users]);

  const institutionCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    users.forEach(u => {
      if (u.institution) {
        counts[u.institution] = (counts[u.institution] || 0) + 1;
      }
    });
    return counts;
  }, [users]);

  const roleChartData = {
    labels: ['Administradores', 'Gerentes', 'Estudantes'],
    datasets: [
      {
        label: 'Número de Usuários',
        data: [roleCounts.admin, roleCounts.manager, roleCounts.other],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const institutionChartData = {
    labels: Object.keys(institutionCounts),
    datasets: [
      {
        label: 'Número de Usuários',
        data: Object.values(institutionCounts),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        // text will be set per chart
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: string | number) { // Ensure only integer ticks
            if (Number.isInteger(value)) {
              return value;
            }
          },
        }
      }
    }
  };
  
  const chartBaseOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          }
        }
      },
      title: {
        display: true,
        font: {
          size: 16,
          family: "'Inter', sans-serif",
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          callback: function(value: string | number) {
            if (Number.isInteger(value)) {
              return value;
            }
          },
        }
      }
    }
  };

  const roleChartOptions = {
    ...chartBaseOptions,
    plugins: {
      ...chartBaseOptions.plugins,
      title: {
        ...chartBaseOptions.plugins.title,
        text: 'Distribuição de Funções'
      }
    }
  };

  const institutionChartOptions = {
    ...chartBaseOptions,
    plugins: {
      ...chartBaseOptions.plugins,
      title: {
        ...chartBaseOptions.plugins.title,
        text: 'Usuários por Instituição'
      }
    }
  };


  if (!user || !['admin', 'manager'].includes(user.role)) {
    return null; // or loading state, handled by redirect
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-lg text-gray-700">Carregando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="ml-2 text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Painel de Controle Administrativo</h1>
        <p className="mt-2 text-gray-600">Gerencie usuários e visualize estatísticas do sistema</p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card: Total de Usuários */}
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Total de Usuários</h3>
          <p className="mt-2 text-3xl font-semibold text-indigo-600">{users.length}</p>
        </div>
        
        {/* Card: Administradores */}
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Administradores</h3>
          <p className="mt-2 text-3xl font-semibold text-emerald-600">{roleCounts.admin}</p>
        </div>
        
        {/* Card: Gerentes */}
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Gerentes</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{roleCounts.manager}</p>
        </div>

        {/* Card: Estudantes */}
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500">Estudantes</h3>
          <p className="mt-2 text-3xl font-semibold text-amber-600">{roleCounts.other}</p>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Distribuição de Funções</h2>
          <div style={{ height: '400px' }}>
            <Bar options={roleChartOptions} data={roleChartData} />
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm rounded-xl border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Usuários por Instituição</h2>
          <div style={{ height: '400px' }}>
            <Bar options={institutionChartOptions} data={institutionChartData} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Lista de Usuários</h2>
        </div>
      
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Função
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === 'admin' ? 'bg-emerald-100 text-emerald-800' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {user.role === 'admin' ? 'Administrador' :
                       user.role === 'manager' ? 'Gerente' :
                       'Estudante'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={user.role === 'admin' || user.role === 'manager'}
                      className={`text-sm font-medium rounded-md px-3 py-1.5 
                        ${user.role === 'admin' || user.role === 'manager'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
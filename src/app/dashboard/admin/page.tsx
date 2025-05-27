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
        setError('Failed to load users');
        console.error('Error loading users:', err);
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
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
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
    labels: ['Administrators', 'Managers', 'Other Users'],
    datasets: [
      {
        label: 'Number of Users',
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
        label: 'Number of Users',
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
  
  const roleChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'User Roles Distribution',
      },
    },
  };

  const institutionChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        ...commonChartOptions.plugins.title,
        text: 'Users per Institution',
      },
    },
  };


  if (!user || !['admin', 'manager'].includes(user.role)) {
    return null; // or loading state, handled by redirect
  }

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin User Dashboard</h1>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Card: Total Users */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{users.length}</p>
        </div>
        
        {/* Stat Card: Administrators */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Administrators</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{roleCounts.admin}</p>
        </div>
        
        {/* Stat Card: Managers */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Managers</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{roleCounts.manager}</p>
        </div>

        {/* Stat Card: Other Users */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Other Users</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{roleCounts.other}</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-8 bg-white p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-center">User Role Distribution</h2>
        <div style={{ height: '400px' }}> {/* Ensure chart has enough space */}
          <Bar options={roleChartOptions} data={roleChartData} />
        </div>
      </div>

      {/* Institution Chart Section */}
      <div className="mb-8 bg-white p-6 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-center">Users per Institution</h2>
        <div style={{ height: '400px' }}> {/* Ensure chart has enough space */}
          <Bar options={institutionChartOptions} data={institutionChartData} />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 mt-8">User List</h2>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900 ml-4"
                    disabled={user.role === 'admin' || user.role === 'manager'} // Prevent deleting admin and managers
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
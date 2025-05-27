'use client';

import { useEffect, useState } from 'react';
import { User } from '../../../types/auth';
import * as authService from '../../../services/auth';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import UserFormModal from '../../../components/UserFormModal'; // Import the modal

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  // Redirect if not admin or manager
  useEffect(() => {
    if (user && !['admin', 'manager'].includes(user.role)) {
      router.push('/dashboard');
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUserAdded = (newUser: User) => {
    setUsers(prevUsers => [...prevUsers, newUser]);
    // Optionally, you could also update MOCK_USERS in authService or similar
    // For now, just updating local state for display
    console.log("User added to local list:", newUser);
  };

  if (!user || !['admin', 'manager'].includes(user.role)) {
    return null; // or loading state
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
        <button
          onClick={handleOpenModal} // Open modal instead of navigating
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Add New User
        </button>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
      />
      
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
          <p className="text-3xl font-bold text-indigo-600 mt-2">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        
        {/* Stat Card: Managers */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Managers</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{users.filter(u => u.role === 'manager').length}</p>
        </div>

        {/* Stat Card: Other Users */}
        <div className="bg-white p-6 shadow-lg rounded-xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
          <h3 className="text-md font-semibold text-gray-600">Other Users</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{users.filter(u => !['admin', 'manager'].includes(u.role)).length}</p>
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

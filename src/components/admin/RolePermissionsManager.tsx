import React, { useState, useEffect } from 'react';
import { useRolePermissions, useAvailablePermissions, useAvailableRoles } from '@/hooks/useRolePermissions';
import { Permission, Role } from '@/services/rolePermissionsService';

export const RolePermissionsManager: React.FC = () => {
  const {
    rolePermissions,
    loading,
    error,
    fetchRolePermissions,
    assignPermission,
    revokePermission,
    assignMultiplePermissions,
    revokeAllPermissions,
    checkPermission,
  } = useRolePermissions();

  const { permissions: availablePermissions } = useAvailablePermissions();
  const { roles: availableRoles } = useAvailableRoles();

  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchRolePermissions(currentPage);
  }, [currentPage]);

  const handleAssignPermission = async (roleId: string, permissionId: string) => {
    try {
      await assignPermission(roleId, permissionId);
      alert('Permissão atribuída com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir permissão:', error);
    }
  };

  const handleRevokePermission = async (roleId: string, permissionId: string) => {
    if (confirm('Tem certeza que deseja revogar esta permissão?')) {
      try {
        await revokePermission(roleId, permissionId);
        alert('Permissão revogada com sucesso!');
      } catch (error) {
        console.error('Erro ao revogar permissão:', error);
      }
    }
  };

  const handleAssignMultiple = async () => {
    if (!selectedRole || selectedPermissions.length === 0) {
      alert('Selecione uma função e pelo menos uma permissão');
      return;
    }

    try {
      await assignMultiplePermissions(selectedRole, selectedPermissions);
      setShowAssignModal(false);
      setSelectedRole('');
      setSelectedPermissions([]);
      alert('Permissões atribuídas com sucesso!');
    } catch (error) {
      console.error('Erro ao atribuir permissões:', error);
    }
  };

  const handleRevokeAll = async (roleId: string) => {
    if (confirm('Tem certeza que deseja revogar TODAS as permissões desta função?')) {
      try {
        await revokeAllPermissions(roleId);
        alert('Todas as permissões foram revogadas!');
      } catch (error) {
        console.error('Erro ao revogar permissões:', error);
      }
    }
  };

  const getRoleName = (roleId: string) => {
    const role = availableRoles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getPermissionName = (permissionId: string) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.name : permissionId;
  };

  const getPermissionsByRole = (roleId: string) => {
    return rolePermissions.filter(rp => rp.roleId === roleId);
  };

  const togglePermissionSelection = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Erro:</strong> {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Gerenciador de Permissões de Função
          </h2>
          
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Atribuir Permissões
          </button>
        </div>

        {/* Tabela de Funções e suas Permissões */}
        <div className="space-y-4">
          {availableRoles.map(role => {
            const rolePermissionsList = getPermissionsByRole(role.id);
            
            return (
              <div key={role.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {role.name}
                  </h3>
                  <div className="flex space-x-2">
                    <span className="text-sm text-gray-500">
                      {rolePermissionsList.length} permissões
                    </span>
                    {rolePermissionsList.length > 0 && (
                      <button
                        onClick={() => handleRevokeAll(role.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Revogar Todas
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {rolePermissionsList.map(rp => (
                    <div
                      key={rp.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700">
                        {getPermissionName(rp.permissionId)}
                      </span>
                      <button
                        onClick={() => handleRevokePermission(rp.roleId, rp.permissionId)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Revogar
                      </button>
                    </div>
                  ))}
                </div>

                {rolePermissionsList.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Nenhuma permissão atribuída a esta função
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Paginação */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {currentPage}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      </div>

      {/* Modal para Atribuir Permissões */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Atribuir Permissões
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecionar Função
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Selecione uma função</option>
                    {availableRoles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecionar Permissões
                  </label>
                  <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {availablePermissions.map(permission => (
                      <label key={permission.id} className="flex items-center space-x-2 p-1">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermissionSelection(permission.id)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">
                          {permission.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedRole('');
                    setSelectedPermissions([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignMultiple}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Atribuir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
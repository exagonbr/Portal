'use client';

import React, { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { UserDto } from '@/types/api';
import { userService } from '@/services/userService';
import { X } from 'lucide-react';

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  user?: UserDto | null;
  onSave: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ show, onClose, user, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [institutions, setInstitutions] = useState<{ value: string; label: string }[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_id: '',
    institution_id: '',
    is_active: true
  });

  useEffect(() => {
    if (show) {
      loadRolesAndInstitutions();
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          confirmPassword: '',
          role_id: user.role_id || '',
          institution_id: user.institution_id || '',
          is_active: user.isActive !== false
        });
      } else {
        // Reset form for new user
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role_id: '',
          institution_id: '',
          is_active: true
        });
      }
    }
  }, [show, user]);

  const loadRolesAndInstitutions = async () => {
    try {
      // Simulando carregamento de roles e instituições
      // Em um cenário real, você usaria services específicos
      setRoles([
        { value: 'admin', label: 'Administrador' },
        { value: 'teacher', label: 'Professor' },
        { value: 'student', label: 'Estudante' }
      ]);
      
      setInstitutions([
        { value: 'inst1', label: 'Instituição 1' },
        { value: 'inst2', label: 'Instituição 2' },
        { value: 'inst3', label: 'Instituição 3' }
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar informações necessárias');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Nome é obrigatório';
    if (!formData.email.trim()) return 'Email é obrigatório';
    if (!user && !formData.password) return 'Senha é obrigatória para novos usuários';
    if (formData.password && formData.password !== formData.confirmPassword) {
      return 'As senhas não coincidem';
    }
    if (!formData.role_id) return 'Função é obrigatória';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      if (user) {
        // Update existing user
        const updateData = {
          name: formData.name,
          email: formData.email,
          role_id: formData.role_id,
          institution_id: formData.institution_id || undefined,
          is_active: formData.is_active
        };
        
        // Add password only if it was changed
        if (formData.password) {
          Object.assign(updateData, { password: formData.password });
        }
        
        await userService.updateUser(user.id, updateData);
      } else {
        // Create new user
        await userService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id,
          institution_id: formData.institution_id || undefined,
          is_active: formData.is_active
        });
      }
      
      onSave();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha {user && <span className="text-gray-500 text-xs">(Deixe em branco para manter a atual)</span>}
              </label>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
                required={!user}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <Input
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="********"
                required={!user || !!formData.password}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
              <Select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione uma função</option>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
              <Select
                name="institution_id"
                value={formData.institution_id}
                onChange={handleChange}
              >
                <option value="">Selecione uma instituição</option>
                {institutions.map(inst => (
                  <option key={inst.value} value={inst.value}>
                    {inst.label}
                  </option>
                ))}
              </Select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Usuário ativo
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              {user ? 'Atualizar' : 'Criar'} Usuário
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 
'use client'

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
// import { Select } from '@/components/ui/Select'; // Removido - usando select HTML nativo
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/ToastManager';
import { CreateUserDto, InstitutionResponseDto } from '@/types/api';
import { Eye, EyeOff, User, Mail, Lock, Shield, Building2, Phone, MapPin } from 'lucide-react';

// Mock dos serviços para remover dependências externas

const mockInstitutionService = {
  getActiveInstitutions: async (): Promise<InstitutionResponseDto[]> => {
    const now = new Date().toISOString();
    return [
      {
        id: 1,
        name: 'Escola SaberCon Digital',
        accountable_contact: 'contato@sabercon.com',
        accountable_name: 'Admin SaberCon',
        company_name: 'SaberCon EdTech',
        contract_disabled: false,
        contract_term_end: new Date(2025, 11, 31).toISOString(),
        contract_term_start: new Date(2023, 0, 1).toISOString(),
        deleted: false,
        district: 'Centro',
        document: '12.345.678/0001-99',
        postal_code: '12345-000',
        state: 'SP',
        street: 'Rua do Saber, 123',
        has_library_platform: true,
        has_principal_platform: true,
        has_student_platform: true,
        date_created: now,
        last_updated: now,
      },
    ];
  }
};

const mockUserService = {
  createUser: async (data: CreateUserDto): Promise<any> => {
    console.log('Mock: Criando usuário com os seguintes dados:', data);
    // Simula uma pequena demora da rede
    await new Promise(resolve => setTimeout(resolve, 500));
    // Simula um sucesso
    return { success: true, message: 'Usuário criado com sucesso (mock).', data };
  }
};

const institutionService = mockInstitutionService;
const userService = mockUserService;

interface UserCreateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function UserCreateModal({ onClose, onSuccess }: UserCreateModalProps) {
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<CreateUserDto>({
    full_name: '',
    email: '',
    password: '',
    institution_id: null,
    is_admin: false,
    is_manager: false,
    is_student: true,
    is_teacher: false,
    enabled: true,
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const institutionsResponse = await institutionService.getActiveInstitutions();
        setInstitutions(institutionsResponse);
      } catch (error) {
        console.log('Erro ao carregar dados:', error);
        showError('Erro ao carregar dados necessários');
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [showError]);

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      showError('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      showError('Email é obrigatório');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Email deve ter um formato válido');
      return false;
    }

    if (!formData.password) {
      showError('Senha é obrigatória');
      return false;
    }

    if (formData.password.length < 6) {
      showError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }

    if (formData.password !== confirmPassword) {
      showError('Senhas não coincidem');
      return false;
    }

    // A validação de perfil (is_admin, etc.) pode ser adicionada aqui se necessário
    const profileSelected = formData.is_admin || formData.is_manager || formData.is_student || formData.is_teacher;
    if (!profileSelected) {
      showError('Pelo menos um perfil (Admin, Gestor, Estudante, Professor) deve ser selecionado.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.createUser(formData);
      showSuccess('Usuário criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.log('Erro ao criar usuário:', error);
      showError(error.message || 'Erro ao criar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Novo Usuário">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-DEFAULT border-t-transparent rounded-full"></div>
          <span className="ml-3 text-slate-600">Carregando dados...</span>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Novo Usuário" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            Informações Básicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nome Completo *
              </label>
              <Input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Digite o nome completo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@exemplo.com"
                  required
                />
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Senha */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-green-500" />
            Senha de Acesso
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Digite a senha novamente"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Perfis e Instituição */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-500" />
            Perfis e Instituição
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seleção de Perfis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Perfis *</label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch id="is_admin" checked={!!formData.is_admin} onChange={(checked: boolean) => setFormData(f => ({...f, is_admin: checked}))} />
                  <label htmlFor="is_admin" className="text-sm text-slate-600">Administrador</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="is_manager" checked={!!formData.is_manager} onChange={(checked: boolean) => setFormData(f => ({...f, is_manager: checked}))} />
                  <label htmlFor="is_manager" className="text-sm text-slate-600">Gestor</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="is_teacher" checked={!!formData.is_teacher} onChange={(checked: boolean) => setFormData(f => ({...f, is_teacher: checked}))} />
                  <label htmlFor="is_teacher" className="text-sm text-slate-600">Professor</label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="is_student" checked={!!formData.is_student} onChange={(checked: boolean) => setFormData(f => ({...f, is_student: checked}))} />
                  <label htmlFor="is_student" className="text-sm text-slate-600">Estudante</label>
                </div>
              </div>
            </div>

            {/* Seleção de Instituição */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Instituição
              </label>
              <div className="relative">
                <select
                  value={formData.institution_id || ''}
                  onChange={(e) => setFormData({ ...formData, institution_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nenhuma</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
                <Building2 className="absolute right-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-orange-500" />
            Informações de Contato (Opcional)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Telefone
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Endereço
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Endereço completo"
                />
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Status do Usuário</h3>
              <p className="text-sm text-slate-600">Defina se o usuário estará habilitado no sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${formData.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {formData.enabled ? 'Habilitado' : 'Desabilitado'}
              </span>
              <Switch
                checked={!!formData.enabled}
                onChange={(checked: boolean) => setFormData({ ...formData, enabled: checked })}
              />
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Criando...
              </div>
            ) : (
              'Criar Usuário'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Palette, Building, School, Save } from 'lucide-react';
import { CreateGroupData } from '@/types/groups';

interface GroupCreateModalProps {
  onClose: () => void;
  onSubmit: (data: CreateGroupData) => Promise<void>;
}

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#EC4899', // pink
  '#6366F1', // indigo
];

export const GroupCreateModal: React.FC<GroupCreateModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    description: '',
    color: PRESET_COLORS[0],
    institution_id: '',
    school_id: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data - em produção, buscar da API
  const institutions = [
    { id: '1', name: 'Universidade Federal' },
    { id: '2', name: 'Instituto Técnico' },
    { id: '3', name: 'Colégio Municipal' }
  ];

  const schools = [
    { id: '1', name: 'Campus Centro', institution_id: '1' },
    { id: '2', name: 'Campus Norte', institution_id: '1' },
    { id: '3', name: 'Unidade Principal', institution_id: '2' },
    { id: '4', name: 'Anexo Sul', institution_id: '2' },
    { id: '5', name: 'Sede Central', institution_id: '3' }
  ];

  const filteredSchools = schools.filter(school => 
    !formData.institution_id || school.institution_id === formData.institution_id
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Descrição deve ter no máximo 500 caracteres';
    }

    if (formData.color && !/^#[0-9A-F]{6}$/i.test(formData.color)) {
      newErrors.color = 'Cor deve estar no formato hexadecimal válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateGroupData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuario começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Se mudou a instituição, limpar escola selecionada
    if (field === 'institution_id') {
      setFormData(prev => ({ ...prev, school_id: '' }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Criar Novo Grupo</h2>
                  <p className="text-blue-100 text-sm">
                    Configure um novo grupo de usuários
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Nome do Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Professores de Matemática"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={255}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva o propósito e função deste grupo..."
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.description?.length || 0}/500
                </p>
              </div>
            </div>

            {/* Cor do Grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cor do Grupo
              </label>
              <div className="flex items-center gap-4">
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleInputChange('color', color)}
                      className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                        formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
              {errors.color && (
                <p className="mt-1 text-sm text-red-600">{errors.color}</p>
              )}
            </div>

            {/* Contexto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instituição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instituição
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.institution_id}
                    onChange={(e) => handleInputChange('institution_id', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as instituições</option>
                    {institutions.map((institution) => (
                      <option key={institution.id} value={institution.id}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Deixe vazio para aplicar a todas as instituições
                </p>
              </div>

              {/* Escola */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escola
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={formData.school_id}
                    onChange={(e) => handleInputChange('school_id', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!formData.institution_id}
                  >
                    <option value="">
                      {formData.institution_id ? 'Todas as escolas desta instituição' : 'Selecione uma instituição primeiro'}
                    </option>
                    {filteredSchools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Deixe vazio para aplicar a todas as escolas da instituição
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Grupo ativo
              </label>
              <p className="text-xs text-gray-500">
                Grupos inativos não afetam as permissões dos usuários
              </p>
            </div>

            {/* Preview */}
            {formData.name && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Grupo</h4>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{formData.name}</div>
                    {formData.description && (
                      <div className="text-sm text-gray-600">{formData.description}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.institution_id ? 
                        institutions.find(i => i.id === formData.institution_id)?.name : 
                        'Todas as instituições'
                      }
                      {formData.school_id && ` • ${filteredSchools.find(s => s.id === formData.school_id)?.name}`}
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {formData.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Criando...' : 'Criar Grupo'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

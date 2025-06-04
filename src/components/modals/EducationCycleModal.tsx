'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { EducationCycle, CreateEducationCycleData, UpdateEducationCycleData, EducationLevel, EDUCATION_LEVEL_LABELS } from '@/types/educationCycle';
import { educationCycleService } from '@/services/educationCycleService';

interface EducationCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  cycle?: EducationCycle;
}

export default function EducationCycleModal({ isOpen, onClose, onSuccess, cycle }: EducationCycleModalProps) {
  const [formData, setFormData] = useState<CreateEducationCycleData>({
    name: '',
    level: 'ENSINO_FUNDAMENTAL_I' as EducationLevel,
    description: '',
    duration_years: 1,
    min_age: undefined,
    max_age: undefined
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cycle) {
      setFormData({
        name: cycle.name,
        level: cycle.level,
        description: cycle.description || '',
        duration_years: cycle.duration_years,
        min_age: cycle.min_age,
        max_age: cycle.max_age
      });
    } else {
      setFormData({
        name: '',
        level: 'ENSINO_FUNDAMENTAL_I' as EducationLevel,
        description: '',
        duration_years: 1,
        min_age: undefined,
        max_age: undefined
      });
    }
  }, [cycle]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (cycle) {
        await educationCycleService.update(cycle.id, formData as UpdateEducationCycleData);
      } else {
        await educationCycleService.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao salvar ciclo educacional');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-50 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {cycle ? 'Editar Ciclo Educacional' : 'Novo Ciclo Educacional'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Nível de Ensino</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
              required
            >
              {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Duração (anos)</label>
            <input
              type="number"
              value={formData.duration_years}
              onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
              min="1"
              max="10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Idade Mínima</label>
              <input
                type="number"
                value={formData.min_age || ''}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Idade Máxima</label>
              <input
                type="number"
                value={formData.max_age || ''}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-100 dark:border-gray-400"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-100 dark:text-gray-700 dark:hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
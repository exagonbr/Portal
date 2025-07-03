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
      <div className="bg-background-primary rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {cycle ? 'Editar Ciclo Educacional' : 'Novo Ciclo Educacional'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
            type="button"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
              Nome
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
              required
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-medium text-text-primary mb-1">
              Nível de Ensino
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as EducationLevel })}
              className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
              required
            >
              {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="duration_years" className="block text-sm font-medium text-text-primary mb-1">
              Duração (anos)
            </label>
            <input
              type="number"
              id="duration_years"
              name="duration_years"
              value={formData.duration_years}
              onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
              min="1"
              max="10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="min_age" className="block text-sm font-medium text-text-primary mb-1">
                Idade Mínima
              </label>
              <input
                type="number"
                id="min_age"
                name="min_age"
                value={formData.min_age || ''}
                onChange={(e) => setFormData({ ...formData, min_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
                min="0"
                max="100"
              />
            </div>

            <div>
              <label htmlFor="max_age" className="block text-sm font-medium text-text-primary mb-1">
                Idade Máxima
              </label>
              <input
                type="number"
                id="max_age"
                name="max_age"
                value={formData.max_age || ''}
                onChange={(e) => setFormData({ ...formData, max_age: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:ring-2 focus:ring-primary bg-background-secondary"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-text-secondary bg-background-tertiary rounded-lg hover:bg-secondary-light"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
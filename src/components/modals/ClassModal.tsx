'use client';

import React, { useState, useEffect } from 'react';
import { Class, CreateClassData, UpdateClassData, SHIFT_LABELS } from '@/types/class';
import { classService } from '@/services/classService';
import { schoolService } from '@/services/schoolService';
import { School } from '@/types/school';

interface ClassModalProps {
  classItem?: Class | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ClassModal({ classItem, onClose, onSave }: ClassModalProps) {
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [formData, setFormData] = useState<CreateClassData>({
    name: '',
    code: '',
    school_id: '',
    year: new Date().getFullYear(),
    shift: 'MORNING',
    max_students: 30
  });

  useEffect(() => {
    loadSchools();
    if (classItem) {
      setFormData({
        name: classItem.name,
        code: classItem.code,
        school_id: classItem.school_id,
        year: classItem.year,
        shift: classItem.shift,
        max_students: classItem.max_students
      });
    }
  }, [classItem]);

  const loadSchools = async () => {
    try {
      const response = await schoolService.list({ limit: 100 });
      setSchools(response.items || []);
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (classItem) {
        await classService.update(classItem.id, formData as UpdateClassData);
      } else {
        await classService.create(formData);
      }
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar turma');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-DEFAULT to-primary-dark text-white p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🏫</span>
                <h2 className="text-2xl font-bold">
                  {classItem ? 'Editar Turma' : 'Nova Turma'}
                </h2>
              </div>
              <p className="text-primary-light/80">
                {classItem ? `Código: ${classItem.code}` : 'Criar nova turma no sistema'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-light/70 transition-colors ml-4 p-1 rounded-full hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  placeholder="Ex: 5º Ano A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  placeholder="Ex: 5A-2025"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Escola *
                </label>
                <select
                  value={formData.school_id}
                  onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                >
                  <option value="">Selecione uma escola</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Ano *
                </label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  min="2020"
                  max="2030"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Turno *
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value as any })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                >
                  {Object.entries(SHIFT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Capacidade Máxima *
                </label>
                <input
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-border-DEFAULT rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT text-text-primary bg-background-primary"
                  required
                  min="1"
                  max="100"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Número máximo de alunos que a turma pode comportar
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-border-light px-6 py-4 bg-background-secondary">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <p className="text-sm text-text-tertiary">
                {classItem ? 'Editando turma existente' : 'Criando nova turma'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-secondary-light text-text-primary rounded-lg hover:bg-secondary-DEFAULT/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="px-4 py-2 bg-primary-DEFAULT text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Salvando...' : classItem ? 'Salvar Alterações' : 'Criar Turma'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
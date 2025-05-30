'use client'

import React, { useState, useEffect, ChangeEvent } from 'react';

interface Unit {
  id: string;
  name: string;
  // Add other relevant unit properties if needed, e.g., address, responsible person
}

interface InstitutionDisplayData {
  id: string;
  name: string;
  location: string; // e.g., "São Paulo, SP"
  status: string; // e.g., "Ativa"
  imageUrl?: string; // Optional image URL
  studentCount: number;
  teacherCount: number;
  courseCount: number;
  type: string; // e.g., "UNIVERSITY", "SCHOOL"
  address?: string;
  units?: Unit[];
}

interface InstitutionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution: InstitutionDisplayData | null;
}

const InstitutionEditModal: React.FC<InstitutionEditModalProps> = ({
  isOpen,
  onClose,
  institution,
}) => {
  const [formData, setFormData] = useState<InstitutionDisplayData | null>(institution);
  const [newUnitName, setNewUnitName] = useState('');

  useEffect(() => {
    if (isOpen && institution) {
      setFormData({ ...institution, units: institution.units ? [...institution.units.map(u => ({...u}))] : [] });
    } else if (!isOpen) {
      setFormData(null); // Clear form data when modal is closed
      setNewUnitName(''); // Clear new unit name as well
    }
  }, [institution, isOpen]);

  if (!isOpen || !institution) {
    return null;
  }

  if (!formData) {
      return null;
  }


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;

    if (e.target.type === 'number') {
      processedValue = value === '' ? 0 : parseInt(value, 10);
      if (isNaN(processedValue as number)) {
        processedValue = 0;
      }
    }

    setFormData(prev => prev ? { ...prev, [name]: processedValue } : null);
  };

  const handleSaveChanges = () => {
    console.log("Saving data:", formData);
    onClose();
  };

  const handleInactivate = () => {
    console.log("Inactivating institution:", formData?.id);
    onClose();
  }

  const handleAddUnit = () => {
    if (newUnitName.trim() === '' || !formData) return;
    const newUnit: Unit = {
      id: `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
      name: newUnitName.trim(),
    };
    setFormData(prev => prev ? { ...prev, units: [...(prev.units || []), newUnit] } : null);
    setNewUnitName(''); // Reset input
  };

  const handleRemoveUnit = (unitId: string) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, units: (prev.units || []).filter(unit => unit.id !== unitId) } : null);
  };

  const handleUnitNameChange = (unitId: string, newName: string) => {
    if (!formData || !formData.units) return;
    setFormData(prev => {
      if (!prev || !prev.units) return prev;
      return {
        ...prev,
        units: prev.units.map(unit => unit.id === unitId ? { ...unit, name: newName } : unit)
      };
    });
  };


  return (
    <div className="fixed inset-0 bg-text-primary/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 overflow-y-auto">
      <div className="bg-background-primary rounded-lg shadow-xl p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">Gerenciar Instituição</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-text-secondary hover:text-text-primary"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }}>
          <div className="space-y-6">
            <fieldset className="border border-border-DEFAULT p-4 rounded-md">
              <legend className="text-lg font-medium text-text-primary px-2">Detalhes da Instituição</legend>
              <div className="space-y-4 mt-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nome da Instituição</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-text-secondary">Localização (Cidade, UF)</label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-text-secondary">Endereço Completo</label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-text-secondary">Tipo de Instituição</label>
                    <input
                      type="text"
                      name="type"
                      id="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-text-secondary">Status</label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Inativa">Inativa</option>
                      <option value="Pendente">Pendente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-text-secondary">URL da Imagem (Opcional)</label>
                  <input
                    type="text"
                    name="imageUrl"
                    id="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="studentCount" className="block text-sm font-medium text-text-secondary">Alunos</label>
                    <input
                    readOnly
                      type="number"
                      name="studentCount"
                      id="studentCount"
                      value={formData.studentCount}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 bg-background-secondary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="teacherCount" className="block text-sm font-medium text-text-secondary">Professores</label>
                    <input
                      readOnly
                      type="number"
                      name="teacherCount"
                      id="teacherCount"
                      value={formData.teacherCount}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 bg-background-secondary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="courseCount" className="block text-sm font-medium text-text-secondary">Unidades de Ensino</label>
                    <input
                      readOnly
                      type="number"
                      name="courseCount"
                      id="courseCount"
                      value={formData.courseCount}
                      onChange={handleChange}
                      min="0"
                      className="mt-1 block w-full px-3 py-2 bg-background-secondary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="border border-border-DEFAULT p-4 rounded-md">
              <legend className="text-lg font-medium text-text-primary px-2">Unidades da Instituição</legend>
              <div className="mt-2 space-y-3">
                {(formData.units || []).map((unit, index) => (
                  <div key={unit.id} className="flex items-center space-x-2 p-2 border-b border-border-light">
                    <input
                      type="text"
                      value={unit.name}
                      onChange={(e) => handleUnitNameChange(unit.id, e.target.value)}
                      className="flex-grow px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                      placeholder={`Nome da Unidade ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(unit.id)}
                      className="text-error-DEFAULT hover:text-error-dark p-1 rounded-full hover:bg-error-light/20"
                      aria-label="Remover Unidade"
                    >
                      <span className="material-icons text-lg">delete_outline</span>
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="flex-grow px-3 py-2 bg-background-primary border border-border-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm"
                    placeholder="Nome da Nova Unidade"
                  />
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="bg-success-DEFAULT text-white px-3 py-2 rounded-lg hover:bg-success-dark text-sm flex items-center"
                  >
                    <span className="material-icons text-lg mr-1">add_circle_outline</span>
                    Adicionar Unidade
                  </button>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="mt-10 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleInactivate}
              className="bg-error-DEFAULT text-white px-4 py-2 rounded-lg hover:bg-error-dark"
            >
              Inativar
            </button>
            <button
              type="submit"
              className="bg-primary-DEFAULT text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary-light text-text-secondary px-4 py-2 rounded-lg hover:bg-secondary-DEFAULT"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstitutionEditModal;
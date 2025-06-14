'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { UnitEditModal } from '@/components/UnitEditModal';
import { useToast } from '@/components/ToastManager';
import { unitService, UnitFilters } from '@/services/unitService';
import { UnitResponseDto, UnitCreateDto, UnitUpdateDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';

export default function AdminUnitsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitResponseDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UnitFilters>({
    search: '',
    type: '',
    active: undefined,
    institution_id: ''
  });
  const [units, setUnits] = useState<UnitResponseDto[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);

  // Load institutions for filter
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        const response = await institutionService.getAll();
        setInstitutions(response.data.map(inst => ({
          id: inst.id,
          name: inst.name
        })));
      } catch (error) {
        showError('Erro ao carregar instituições');
      }
    };
    loadInstitutions();
  }, []);

  // Load units
  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const response = await unitService.list(filters);
      setUnits(response.items);
      setTotalItems(response.pagination.total);
    } catch (error) {
      showError('Erro ao carregar unidades');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [currentPage, filters]);

  const handleAdd = () => {
    setSelectedUnit(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (item: { id: string | number }) => {
    const unit = units.find(u => u.id === item.id);
    if (unit) {
      setSelectedUnit(unit);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async (item: { id: string | number }) => {
    const id = String(item.id);
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;
    
    try {
      await unitService.delete(id);
      showSuccess('Unidade excluída com sucesso!');
      loadUnits();
    } catch (error) {
      showError('Erro ao excluir unidade');
    }
  };

  const handleSave = async (data: UnitCreateDto | UnitUpdateDto) => {
    try {
      if (selectedUnit) {
        await unitService.update(selectedUnit.id, data as UnitUpdateDto);
        showSuccess('Unidade atualizada com sucesso!');
      } else {
        await unitService.create(data as UnitCreateDto);
        showSuccess('Unidade criada com sucesso!');
      }
      loadUnits();
    } catch (error) {
      showError('Erro ao salvar unidade');
      throw error;
    }
  };

  const columns = [
    { 
      key: 'name',
      label: 'Nome',
      render: (item: any) => item.name
    },
    { 
      key: 'type',
      label: 'Tipo',
      render: (item: any) => item.type
    },
    { 
      key: 'institution',
      label: 'Instituição',
      render: (item: any) => item.institution?.name || '-'
    },
    { 
      key: 'active',
      label: 'Status',
      render: (item: any) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          item.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {item.active ? 'Ativo' : 'Inativo'}
        </span>
      )
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Unidades</h1>
        <Button onClick={handleAdd}>Nova Unidade</Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Input
            placeholder="Buscar unidades..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Select
            value={filters.type}
            onChange={(value) => setFilters({ ...filters, type: value as string })}
            options={[
              { value: '', label: 'Todos os tipos' },
              { value: 'ESCOLA', label: 'Escola' },
              { value: 'FACULDADE', label: 'Faculdade' },
              { value: 'UNIVERSIDADE', label: 'Universidade' },
              { value: 'CENTRO_EDUCACIONAL', label: 'Centro Educacional' }
            ]}
          />
          <Select
            value={filters.institution_id}
            onChange={(value) => setFilters({ ...filters, institution_id: value as string })}
            options={[
              { value: '', label: 'Todas as instituições' },
              ...institutions.map((inst) => ({
                value: inst.id,
                label: inst.name
              }))
            ]}
          />
          <Select
            value={filters.active?.toString()}
            onChange={(value) => setFilters({ ...filters, active: value === 'true' ? true : value === 'false' ? false : undefined })}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'true', label: 'Ativos' },
              { value: 'false', label: 'Inativos' }
            ]}
          />
        </div>

        <GenericCRUD
          title="Unidades"
          entityName="Unidade"
          data={units}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isLoading}
          totalItems={totalItems}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {(isEditModalOpen || isAddModalOpen) && (
        <UnitEditModal
          unit={selectedUnit || undefined}
          onSave={handleSave}
          onClose={() => {
            setIsEditModalOpen(false);
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
}


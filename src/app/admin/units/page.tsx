'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import GenericCRUD from '@/components/crud/GenericCRUD';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { UnitEditModal } from '@/components/UnitEditModal';
import { toast } from 'react-hot-toast';
import { unitService, UnitFilters } from '@/services/unitService';
import { UnitResponseDto, UnitCreateDto, UnitUpdateDto } from '@/types/api';
import { institutionService } from '@/services/institutionService';

export default function AdminUnitsPage() {
  const { user } = useAuth();
  
  // State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitResponseDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<UnitFilters>({
    searchTerm: '',
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
        const response = await institutionService.list();
        setInstitutions(response.data.map(inst => ({
          id: inst.id,
          name: inst.name
        })));
      } catch (error) {
        toast.error('Erro ao carregar instituições');
      }
    };
    loadInstitutions();
  }, []);

  // Load units
  const loadUnits = async () => {
    setIsLoading(true);
    try {
      const response = await unitService.list({
        ...filters,
        page: currentPage,
        limit: 10
      });
      setUnits(response.data);
      setTotalItems(response.total);
    } catch (error) {
      toast.error('Erro ao carregar unidades');
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

  const handleEdit = (unit: UnitResponseDto) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;
    
    try {
      await unitService.delete(id);
      toast.success('Unidade excluída com sucesso!');
      loadUnits();
    } catch (error) {
      toast.error('Erro ao excluir unidade');
    }
  };

  const handleSave = async (data: UnitCreateDto | UnitUpdateDto) => {
    try {
      if (selectedUnit) {
        await unitService.update(selectedUnit.id, data as UnitUpdateDto);
        toast.success('Unidade atualizada com sucesso!');
      } else {
        await unitService.create(data as UnitCreateDto);
        toast.success('Unidade criada com sucesso!');
      }
      loadUnits();
    } catch (error) {
      toast.error('Erro ao salvar unidade');
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
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          />
          <Select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">Todos os tipos</option>
            <option value="ESCOLA">Escola</option>
            <option value="FACULDADE">Faculdade</option>
            <option value="UNIVERSIDADE">Universidade</option>
            <option value="CENTRO_EDUCACIONAL">Centro Educacional</option>
          </Select>
          <Select
            value={filters.institution_id}
            onChange={(e) => setFilters({ ...filters, institution_id: e.target.value })}
          >
            <option value="">Todas as instituições</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </Select>
          <Select
            value={filters.active?.toString()}
            onChange={(e) => setFilters({ ...filters, active: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
          >
            <option value="">Todos os status</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </Select>
        </div>

        <GenericCRUD
          data={units}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={isLoading}
          pagination={{
            currentPage,
            totalItems,
            onPageChange: setCurrentPage
          }}
        />
      </div>

      {(isEditModalOpen || isAddModalOpen) && (
        <UnitEditModal
          unit={selectedUnit}
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


'use client';

import React, { useState } from 'react';

interface SchoolUnit {
  id: string;
  name: string;
  principal?: string;
  studentsCount: number;
  teachersCount: number;
  classesCount: number;
  type: 'elementary' | 'middle' | 'high' | 'technical';
  status: 'active' | 'inactive';
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
}

interface SchoolsListProps {
  initialSchools: SchoolUnit[];
  institutions: any[];
}

export function SchoolsList({ initialSchools, institutions }: SchoolsListProps) {
  const [schools, setSchools] = useState<SchoolUnit[]>(initialSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'elementary' | 'middle' | 'high' | 'technical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredSchools = schools.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (school.address?.street || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || school.type === filterType;
    const matchesStatus = filterStatus === 'all' || school.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      elementary: 'Fundamental I',
      middle: 'Fundamental II',
      high: 'Ensino Médio',
      technical: 'Técnico'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Buscar escolas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">Todos os Tipos</option>
          <option value="elementary">Fundamental I</option>
          <option value="middle">Fundamental II</option>
          <option value="high">Ensino Médio</option>
          <option value="technical">Técnico</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      {/* Schools List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school) => (
          <div key={school.id} className="rounded-lg shadow-lg p-4 border">
            <h3 className="text-lg font-semibold mb-1">{school.name}</h3>
            <p className="text-sm mb-2">Diretor(a): {school.principal || 'Não informado'}</p>
            <p className="text-sm mb-2">Endereço: {school.address?.street || 'Não informado'}</p>
            <p className="text-sm mb-2">Telefone: {school.contact?.phone || 'Não informado'}</p>
            <p className="text-sm mb-2">Status: {school.status === 'active' ? 'Ativa' : 'Inativa'}</p>
            <p className="text-sm mb-2">Tipo: {getTypeLabel(school.type)}</p>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{school.studentsCount}</p>
                <p className="text-xs text-gray-600">Alunos</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{school.teachersCount}</p>
                <p className="text-xs text-gray-600">Professores</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <p className="text-lg font-semibold">{school.classesCount}</p>
                <p className="text-xs text-gray-600">Turmas</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-500">Nenhuma escola encontrada</p>
        </div>
      )}
    </div>
  );
}

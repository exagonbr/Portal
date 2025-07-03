import React from 'react';

interface Stats {
  total: number;
  active: number;
  totalStudents: number;
  totalTeachers: number;
}

interface SchoolsHeaderProps {
  stats: Stats;
}

export function SchoolsHeader({ stats }: SchoolsHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Gestão de Escolas</h1>
      <p>Gerencie as escolas da instituição</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-4 rounded-lg border">
          <p>Total de Escolas</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Escolas Ativas</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Total de Alunos</p>
          <p className="text-2xl font-bold">{stats.totalStudents}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Total de Professores</p>
          <p className="text-2xl font-bold">{stats.totalTeachers}</p>
        </div>
      </div>
    </div>
  );
}

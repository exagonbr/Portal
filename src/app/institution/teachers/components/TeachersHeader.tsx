import React from 'react';

interface Stats {
  total: number;
  active: number;
  totalClasses: number;
  avgExperience: number;
}

interface TeachersHeaderProps {
  stats: Stats;
}

export function TeachersHeader({ stats }: TeachersHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2">Gestão de Professores</h1>
      <p>Gerencie o corpo docente da instituição</p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="p-4 rounded-lg border">
          <p>Total de Professores</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Professores Ativos</p>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Total de Turmas</p>
          <p className="text-2xl font-bold">{stats.totalClasses}</p>
        </div>
        <div className="p-4 rounded-lg border">
          <p>Média de Experiência</p>
          <p className="text-2xl font-bold">{stats.avgExperience} anos</p>
        </div>
      </div>
    </div>
  );
}

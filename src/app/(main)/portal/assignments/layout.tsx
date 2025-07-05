'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AssignmentsLayoutProps {
  children: React.ReactNode;
}

export default function AssignmentsLayout({ children }: AssignmentsLayoutProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const statuses = [
    { id: 'all', name: 'Todas', icon: Calendar },
    { id: 'pending', name: 'Pendentes', icon: Clock },
    { id: 'completed', name: 'Concluídas', icon: CheckCircle },
    { id: 'late', name: 'Atrasadas', icon: XCircle },
    { id: 'upcoming', name: 'Próximas', icon: AlertCircle },
  ];

  const subjects = [
    { id: 'all', name: 'Todas as Disciplinas' },
    { id: 'math', name: 'Matemática' },
    { id: 'portuguese', name: 'Português' },
    { id: 'science', name: 'Ciências' },
    { id: 'history', name: 'História' },
    { id: 'geography', name: 'Geografia' },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-background-primary shadow-sm border-b border-border sticky top-0 z-20">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Título */}
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold text-text-primary">Atividades</h1>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar atividades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background-primary text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <button
                    className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-background-primary text-text-primary hover:bg-background-secondary transition-colors flex items-center justify-between gap-2"
                    onClick={() => {/* Toggle dropdown */}}
                  >
                    <Filter className="w-5 h-5" />
                    <span className="hidden sm:inline">Disciplina</span>
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex overflow-x-auto -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pb-2">
              <div className="flex gap-2">
                {statuses.map((status) => {
                  const Icon = status.icon;
                  return (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 ${
                        selectedStatus === status.id
                          ? 'bg-primary text-white'
                          : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{status.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disciplinas */}
            <div className="flex overflow-x-auto -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pb-2">
              <div className="flex gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject.id)}
                    className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedSubject === subject.id
                        ? 'bg-primary text-white'
                        : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
} 
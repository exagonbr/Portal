'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Search,
  Filter,
  ChevronDown,
  Grid,
  List
} from 'lucide-react';

interface CoursesLayoutProps {
  children: React.ReactNode;
}

export default function CoursesLayout({ children }: CoursesLayoutProps) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'all', name: 'Todos os Cursos' },
    { id: 'math', name: 'Matemática' },
    { id: 'science', name: 'Ciências' },
    { id: 'languages', name: 'Línguas' },
    { id: 'humanities', name: 'Humanas' },
  ];

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <header className="bg-background-primary shadow-sm border-b border-border sticky top-0 z-20">
        <div className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4">
            {/* Título e Ações */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-lg sm:text-xl font-semibold text-text-primary">Cursos</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar cursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background-primary text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="relative">
                <button
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-border bg-background-primary text-text-primary hover:bg-background-secondary transition-colors flex items-center justify-between gap-2"
                  onClick={() => {/* Toggle dropdown */}}
                >
                  <Filter className="w-5 h-5" />
                  <span>Filtrar por</span>
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Categorias */}
            <div className="flex overflow-x-auto -mx-3 sm:-mx-6 lg:-mx-8 px-3 sm:px-6 lg:px-8 pb-2">
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-primary text-white'
                        : 'bg-background-secondary text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {category.name}
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
'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import StandardTable from '@/components/ui/StandardTable';

export default function CoursesPage() {
  const [courses] = useState([
    {
      id: 1,
      name: 'Matemática Básica',
      code: 'MAT101',
      instructor: 'Prof. Ana Silva',
      students: 45,
      status: 'Ativo',
      category: 'Exatas',
      startDate: '2024-01-15',
      endDate: '2024-06-15',
      progress: '75%'
    },
    {
      id: 2,
      name: 'Português Avançado',
      code: 'POR201',
      instructor: 'Prof. Carlos Santos',
      students: 32,
      status: 'Ativo',
      category: 'Linguagens',
      startDate: '2024-02-01',
      endDate: '2024-07-01',
      progress: '60%'
    },
    {
      id: 3,
      name: 'História do Brasil',
      code: 'HIS101',
      instructor: 'Prof. Maria Oliveira',
      students: 28,
      status: 'Concluído',
      category: 'Humanas',
      startDate: '2023-08-01',
      endDate: '2023-12-15',
      progress: '100%'
    }
  ]);

  const statsCards = [
    {
      title: 'Total de Cursos',
      value: 24,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'blue',
      change: { value: 8, trend: 'up' as const, period: 'desde o último mês' }
    },
    {
      title: 'Cursos Ativos',
      value: 18,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      change: { value: 12, trend: 'up' as const, period: 'esta semana' }
    },
    {
      title: 'Total de Alunos',
      value: 1247,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      color: 'purple',
      change: { value: 15, trend: 'up' as const, period: 'este mês' }
    },
    {
      title: 'Taxa de Conclusão',
      value: '87%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: 'indigo',
      change: { value: 5, trend: 'up' as const, period: 'última semana' }
    }
  ];

  const tableColumns = [
    {
      key: 'name',
      title: 'Nome do Curso',
      sortable: true,
      render: (value: string, record: any) => (
        <div>
          <div className="font-medium text-gray-700">{value}</div>
          <div className="text-sm text-gray-500">Código: {record.code}</div>
        </div>
      )
    },
    {
      key: 'instructor',
      title: 'Instrutor',
      sortable: true
    },
    {
      key: 'students',
      title: 'Alunos',
      sortable: true,
      render: (value: number) => (
        <span className="text-center font-medium">{value}</span>
      )
    },
    {
      key: 'category',
      title: 'Categoria',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Exatas' ? 'bg-blue-100 text-blue-800' :
          value === 'Linguagens' ? 'bg-green-100 text-green-800' :
          value === 'Humanas' ? 'bg-purple-100 text-purple-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Ativo' ? 'bg-green-100 text-green-800' :
          value === 'Concluído' ? 'bg-blue-100 text-blue-800' :
          value === 'Pausado' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'progress',
      title: 'Progresso',
      render: (value: string) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: value }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      )
    }
  ];

  const rightSidebarContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Ações Rápidas</h3>
        <div className="space-y-3">
          <Link 
            href="/courses/new"
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 text-center block font-medium shadow-sm"
          >
            📚 Novo Curso
          </Link>
          <Link 
            href="/courses/import"
            className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl hover:bg-emerald-700 transition-all duration-200 text-center block font-medium shadow-sm"
          >
            📁 Importar Cursos
          </Link>
          <Link 
            href="/courses/reports"
            className="w-full bg-violet-600 text-white px-4 py-3 rounded-xl hover:bg-violet-700 transition-all duration-200 text-center block font-medium shadow-sm"
          >
            📊 Relatórios
          </Link>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cursos Populares</h3>
        <div className="space-y-3">
          {[
            { name: 'Matemática Básica', students: 45, rating: 4.8 },
            { name: 'Português Avançado', students: 32, rating: 4.6 },
            { name: 'Química Geral', students: 38, rating: 4.7 }
          ].map((course, index) => (
            <div key={index} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="font-semibold text-sm text-slate-800">{course.name}</div>
              <div className="text-xs text-slate-600 mt-1.5">
                {course.students} alunos • ⭐ {course.rating}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Estatísticas</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Novos esta semana</span>
            <span className="text-sm font-semibold text-slate-800">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Aguardando aprovação</span>
            <span className="text-sm font-semibold text-slate-800">2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Finalizando este mês</span>
            <span className="text-sm font-semibold text-slate-800">5</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gestão de Cursos</h1>
            <p className="text-slate-600 mt-1">Gerencie todos os cursos da plataforma educacional</p>
          </div>
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
              Dashboard
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium">Cursos</span>
          </nav>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color as any}
            change={stat.change}
          />
        ))}
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Filters and Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar cursos..."
                    className="w-64 pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-slate-50 transition-all duration-200"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                <select className="border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200">
                  <option>Todas as categorias</option>
                  <option>Exatas</option>
                  <option>Linguagens</option>
                  <option>Humanas</option>
                </select>

                <select className="border border-slate-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all duration-200">
                  <option>Todos os status</option>
                  <option>Ativo</option>
                  <option>Concluído</option>
                  <option>Pausado</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2.5 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium">
                  Exportar
                </button>
                <Link 
                  href="/courses/new"
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm"
                >
                  Novo Curso
                </Link>
              </div>
            </div>
          </div>

          {/* Courses Table */}
          <StandardTable
            columns={tableColumns}
            data={courses}
            actions={{
              title: 'Ações',
              render: (record) => (
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Ver
                  </button>
                  <button className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
                    Editar
                  </button>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Excluir
                  </button>
                </div>
              )
            }}
            pagination={{
              current: 1,
              pageSize: 10,
              total: 24,
              onChange: (page, pageSize) => {
                console.log('Page changed:', page, pageSize);
              }
            }}
          />
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {rightSidebarContent}
        </div>
      </div>
    </div>
  );
}

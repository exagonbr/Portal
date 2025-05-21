'use client'

import { useState } from 'react'
import CourseCard from '@/components/CourseCard'
import { EDUCATION_LEVELS, EDUCATION_MODALITIES } from '@/constants/education'
import type { Course } from '@/types/education'

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    name: 'Matemática Fundamental',
    description: 'Fundamentos de matemática para o ensino fundamental',
    level: 'BASIC',
    cycle: 'Anos Iniciais',
    stage: '5º ano',
    institution: {
      id: '1',
      name: 'Escola Municipal São José',
      type: 'UNIVERSITY',
      characteristics: [
        'Ensino fundamental completo',
        'Laboratório de matemática',
        'Professores especializados'
      ]
    },
    duration: '1 ano letivo',
    schedule: {
      startDate: '2024-02-01',
      endDate: '2024-12-15',
      classDays: ['Segunda', 'Quarta', 'Sexta'],
      classTime: '07:30 - 11:30'
    }
  },
  {
    id: '2',
    name: 'Desenvolvimento Web Full Stack',
    description: 'Curso técnico profissionalizante de desenvolvimento web',
    level: 'PROFESSIONAL',
    modality: 'DISTANCE',
    institution: {
      id: '2',
      name: 'Instituto Federal de Tecnologia',
      type: 'FEDERAL_INSTITUTE',
      characteristics: [
        'Ensino técnico de qualidade',
        'Professores experientes',
        'Laboratórios modernos'
      ]
    },
    duration: '18 meses',
    schedule: {
      startDate: '2024-03-01',
      endDate: '2025-08-30',
      classDays: ['Terça', 'Quinta'],
      classTime: '19:00 - 22:00'
    }
  },
  {
    id: '3',
    name: 'Educação Especial - Alfabetização',
    description: 'Programa especializado de alfabetização para alunos com necessidades especiais',
    level: 'SPECIAL',
    modality: 'SPECIAL',
    institution: {
      id: '3',
      name: 'Centro de Apoio Educacional Especializado',
      type: 'TECH_CENTER',
      characteristics: [
        'Atendimento individualizado',
        'Equipe multidisciplinar',
        'Materiais adaptados'
      ]
    },
    duration: '12 meses',
    schedule: {
      startDate: '2024-02-01',
      endDate: '2024-12-15',
      classDays: ['Segunda', 'Quarta', 'Sexta'],
      classTime: '08:00 - 12:00'
    }
  }
]

export default function CoursesPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedModality, setSelectedModality] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCourses = MOCK_COURSES.filter(course => {
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchesModality = selectedModality === 'all' || course.modality === selectedModality
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesLevel && matchesModality && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cursos Disponíveis</h1>
          <p className="mt-2 text-sm text-gray-500">
            Explore nossos cursos e encontre o programa ideal para sua jornada educacional
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-700">
              Nível Educacional
            </label>
            <select
              id="level"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todos os Níveis</option>
              {Object.entries(EDUCATION_LEVELS).map(([key]) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="modality" className="block text-sm font-medium text-gray-700">
              Modalidade
            </label>
            <select
              id="modality"
              value={selectedModality}
              onChange={(e) => setSelectedModality(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Todas as Modalidades</option>
              {Object.entries(EDUCATION_MODALITIES).map(([key, modality]) => (
                <option key={key} value={key}>
                  {modality.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Buscar Cursos
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                placeholder="Digite para pesquisar..."
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={() => alert(`Inscrito no curso: ${course.name}`)}
              onViewDetails={() => alert(`Detalhes do curso: ${course.name}`)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum curso encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar seus filtros ou critérios de busca
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

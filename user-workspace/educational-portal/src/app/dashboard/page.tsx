'use client'

import { useState } from 'react'
import StudentProgress from '@/components/StudentProgress'
import CourseCard from '@/components/CourseCard'
import CourseMaterials from '@/components/CourseMaterials'
import CourseQuiz from '@/components/CourseQuiz'

// Mock data for demonstration
const MOCK_STUDENT = {
  id: '1',
  name: 'João Silva',
  birthDate: '2010-05-15',
  currentLevel: 'BASIC' as const,
  currentCycle: 'Anos Iniciais',
  currentStage: '5º ano'
}

const MOCK_COURSE = {
  id: '1',
  name: 'Matemática Fundamental',
  description: 'Fundamentos de matemática para o ensino fundamental',
  level: 'BASIC' as const,
  cycle: 'Anos Iniciais',
  stage: '5º ano',
  institution: {
    id: '1',
    name: 'Escola Municipal São José',
    type: 'UNIVERSITY' as const,
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
}

const MOCK_PROGRESS = {
  studentId: '1',
  courseId: '1',
  stageId: '1',
  progress: 75,
  grades: {
    assignments: 8.5,
    tests: 7.8,
    projects: 9.0,
    participation: 8.0,
    final: 8.3
  },
  attendance: {
    total: 100,
    present: 85,
    absent: 10,
    justified: 5
  }
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'quiz'>('overview')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {MOCK_STUDENT.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          Continue seus estudos de onde parou
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cursos Ativos
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">3</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Atividades Pendentes
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">5</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Média Geral
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">8.5</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Frequência
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">85%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Selecione uma aba
          </label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
          >
            <option value="overview">Visão Geral</option>
            <option value="materials">Materiais</option>
            <option value="quiz">Avaliações</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="flex space-x-4" aria-label="Tabs">
            {['overview', 'materials', 'quiz'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`${
                  activeTab === tab
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                } px-3 py-2 font-medium text-sm rounded-md capitalize`}
              >
                {tab === 'overview' ? 'Visão Geral' : 
                 tab === 'materials' ? 'Materiais' : 'Avaliações'}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <>
            <StudentProgress 
              student={MOCK_STUDENT}
              course={MOCK_COURSE}
              progress={MOCK_PROGRESS}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <CourseCard
                course={MOCK_COURSE}
                isEnrolled={true}
                onViewDetails={() => {}}
              />
            </div>
          </>
        )}

        {activeTab === 'materials' && (
          <CourseMaterials />
        )}

        {activeTab === 'quiz' && (
          <CourseQuiz />
        )}
      </div>
    </div>
  )
}

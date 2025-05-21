'use client'

import { useState } from 'react'

interface Material {
  id: string
  title: string
  type: 'pdf' | 'video' | 'quiz' | 'assignment'
  url: string
  duration?: string
  dueDate?: string
}

interface Lesson {
  id: string
  title: string
  description: string
  materials: Material[]
  isCompleted: boolean
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  isUnlocked: boolean
}

// Mock data - In a real app, this would come from an API
const MOCK_MODULES: Module[] = [
  {
    id: '1',
    title: 'Módulo 1: Introdução à Matemática Fundamental',
    description: 'Conceitos básicos e fundamentos da matemática',
    isUnlocked: true,
    lessons: [
      {
        id: '1.1',
        title: 'Números Naturais',
        description: 'Compreendendo os números naturais e suas propriedades',
        isCompleted: true,
        materials: [
          {
            id: 'm1',
            title: 'Introdução aos Números Naturais',
            type: 'video',
            url: '/materials/video1.mp4',
            duration: '15:00'
          },
          {
            id: 'm2',
            title: 'Exercícios - Números Naturais',
            type: 'pdf',
            url: '/materials/exercises1.pdf'
          },
          {
            id: 'm3',
            title: 'Quiz - Números Naturais',
            type: 'quiz',
            url: '/quiz/1'
          }
        ]
      },
      {
        id: '1.2',
        title: 'Operações Básicas',
        description: 'Adição, subtração, multiplicação e divisão',
        isCompleted: false,
        materials: [
          {
            id: 'm4',
            title: 'Operações Fundamentais',
            type: 'video',
            url: '/materials/video2.mp4',
            duration: '20:00'
          },
          {
            id: 'm5',
            title: 'Atividade Prática',
            type: 'assignment',
            url: '/assignments/1',
            dueDate: '2024-03-15'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Módulo 2: Frações e Números Decimais',
    description: 'Entendendo frações e números decimais',
    isUnlocked: false,
    lessons: [
      {
        id: '2.1',
        title: 'Conceito de Frações',
        description: 'Introdução às frações e suas aplicações',
        isCompleted: false,
        materials: [
          {
            id: 'm6',
            title: 'Frações no Dia a Dia',
            type: 'video',
            url: '/materials/video3.mp4',
            duration: '18:00'
          }
        ]
      }
    ]
  }
]

export default function CourseMaterials() {
  const [activeModule, setActiveModule] = useState<string>(MOCK_MODULES[0].id)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson => lesson.isCompleted).length
    const totalLessons = module.lessons.length
    return Math.round((completedLessons / totalLessons) * 100)
  }

  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'pdf':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'quiz':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'assignment':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Materiais do Curso</h2>
          <p className="mt-1 text-sm text-gray-500">
            Acompanhe seu progresso e acesse os materiais de cada módulo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Modules Sidebar */}
        <div className="lg:col-span-1 border-r border-gray-200">
          <nav className="space-y-1 p-4">
            {MOCK_MODULES.map(module => (
              <button
                key={module.id}
                onClick={() => setActiveModule(module.id)}
                disabled={!module.isUnlocked}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeModule === module.id
                    ? 'bg-blue-50 text-blue-700'
                    : module.isUnlocked
                    ? 'text-gray-700 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{module.title}</span>
                  {!module.isUnlocked && (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                </div>
                <div className="mt-1">
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-1 text-xs flex rounded bg-gray-200">
                      <div
                        style={{ width: `${getModuleProgress(module)}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {getModuleProgress(module)}% concluído
                  </p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 p-6">
          {MOCK_MODULES.map(module => (
            module.id === activeModule && (
              <div key={module.id}>
                <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{module.description}</p>

                <div className="mt-6 space-y-6">
                  {module.lessons.map(lesson => (
                    <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                      <button
                        onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {lesson.isCompleted ? (
                              <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <span className="ml-3 text-sm font-medium text-gray-900">{lesson.title}</span>
                          </div>
                          <svg
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                              activeLesson === lesson.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {activeLesson === lesson.id && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">{lesson.description}</p>
                          
                          <div className="mt-4 space-y-3">
                            {lesson.materials.map(material => (
                              <a
                                key={material.id}
                                href={material.url}
                                className="flex items-center p-3 rounded-lg hover:bg-gray-100"
                              >
                                {getMaterialIcon(material.type)}
                                <div className="ml-4">
                                  <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                  {material.duration && (
                                    <p className="text-xs text-gray-500">Duração: {material.duration}</p>
                                  )}
                                  {material.dueDate && (
                                    <p className="text-xs text-gray-500">
                                      Entrega até: {new Date(material.dueDate).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

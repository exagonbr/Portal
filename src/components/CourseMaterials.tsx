'use client'

import { useState } from 'react'

interface Material {
  id: string
  title: string
  type: 'pdf' | 'video' | 'quiz' | 'assignment'
  url: string
  duration?: string
  dueDate?: string
  xp?: number
  completed?: boolean
}

interface Lesson {
  id: string
  title: string
  description: string
  materials: Material[]
  isCompleted: boolean
  xp: number
  unlockRequirements?: {
    lessonId: string
    minimumScore?: number
  }[]
}

interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  isUnlocked: boolean
  xp: number
}

// Mock data enhanced with XP and gamification elements
const MOCK_MODULES: Module[] = [
  {
    id: '1',
    title: 'Módulo 1: Introdução à Matemática Fundamental',
    description: 'Conceitos básicos e fundamentos da matemática',
    isUnlocked: true,
    xp: 1000,
    lessons: [
      {
        id: '1.1',
        title: 'Números Naturais',
        description: 'Compreendendo os números naturais e suas propriedades',
        isCompleted: true,
        xp: 300,
        materials: [
          {
            id: 'm1',
            title: 'Introdução aos Números Naturais',
            type: 'video',
            url: '/materials/video1.mp4',
            duration: '15:00',
            xp: 100,
            completed: true
          },
          {
            id: 'm2',
            title: 'Exercícios - Números Naturais',
            type: 'pdf',
            url: '/materials/exercises1.pdf',
            xp: 50,
            completed: true
          },
          {
            id: 'm3',
            title: 'Quiz - Números Naturais',
            type: 'quiz',
            url: '/quiz/1',
            xp: 150,
            completed: true
          }
        ]
      },
      {
        id: '1.2',
        title: 'Operações Básicas',
        description: 'Adição, subtração, multiplicação e divisão',
        isCompleted: false,
        xp: 400,
        materials: [
          {
            id: 'm4',
            title: 'Operações Fundamentais',
            type: 'video',
            url: '/materials/video2.mp4',
            duration: '20:00',
            xp: 150
          },
          {
            id: 'm5',
            title: 'Atividade Prática',
            type: 'assignment',
            url: '/assignments/1',
            dueDate: '2024-03-15',
            xp: 250
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
    xp: 1200,
    lessons: [
      {
        id: '2.1',
        title: 'Conceito de Frações',
        description: 'Introdução às frações e suas aplicações',
        isCompleted: false,
        xp: 500,
        unlockRequirements: [
          { lessonId: '1.1', minimumScore: 70 },
          { lessonId: '1.2', minimumScore: 70 }
        ],
        materials: [
          {
            id: 'm6',
            title: 'Frações no Dia a Dia',
            type: 'video',
            url: '/materials/video3.mp4',
            duration: '18:00',
            xp: 200
          }
        ]
      }
    ]
  }
]

export default function CourseMaterials() {
  const [activeModule, setActiveModule] = useState<string>(MOCK_MODULES[0].id)
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [hoveredMaterial, setHoveredMaterial] = useState<string | null>(null)

  const getTotalXP = () => {
    return MOCK_MODULES.reduce((total, module) => {
      const moduleXP = module.lessons.reduce((lessonTotal, lesson) => {
        const materialXP = lesson.materials.reduce((materialTotal, material) => 
          materialTotal + (material.completed ? (material.xp || 0) : 0), 0)
        return lessonTotal + (lesson.isCompleted ? lesson.xp : materialXP)
      }, 0)
      return total + moduleXP
    }, 0)
  }

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson => lesson.isCompleted).length
    const totalLessons = module.lessons.length
    return Math.round((completedLessons / totalLessons) * 100)
  }

  const getMaterialIcon = (type: Material['type']) => {
    const baseClasses = "h-5 w-5 transition-transform duration-300 transform"
    switch (type) {
      case 'pdf':
        return (
          <svg className={`${baseClasses} text-error-color`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg className={`${baseClasses} text-accent-color`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'quiz':
        return (
          <svg className={`${baseClasses} text-warning-color`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'assignment':
        return (
          <svg className={`${baseClasses} text-success-color`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        )
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with XP Counter */}
      <div className="border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Materiais do Curso</h2>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe seu progresso e acesse os materiais de cada módulo
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-warning-color/10 px-4 py-2 rounded-full">
            <svg className="h-6 w-6 text-warning-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-lg font-bold text-warning-color">{getTotalXP()} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {/* Learning Path Sidebar */}
        <div className="lg:col-span-1 border-r border-gray-200">
          <nav className="space-y-1 p-4">
            {MOCK_MODULES.map((module, moduleIndex) => (
              <div key={module.id} className="relative">
                {moduleIndex > 0 && (
                  <div className="absolute -top-4 left-4 w-0.5 h-4 bg-gray-200" />
                )}
                <button
                  onClick={() => setActiveModule(module.id)}
                  disabled={!module.isUnlocked}
                  className={`w-full text-left px-3 py-2 rounded-md transition-all duration-300 ${
                    activeModule === module.id
                      ? 'bg-primary-color/10 text-primary-color'
                      : module.isUnlocked
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{module.title}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-warning-color">{module.xp} XP</span>
                      {!module.isUnlocked && (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-1.5 text-xs flex rounded bg-gray-200">
                        <div
                          style={{ width: `${getModuleProgress(module)}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-color transition-all duration-500"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {getModuleProgress(module)}% concluído
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 p-6">
          {MOCK_MODULES.map(module => (
            module.id === activeModule && (
              <div key={module.id} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{module.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{module.description}</p>
                </div>

                <div className="space-y-6">
                  {module.lessons.map(lesson => (
                    <div 
                      key={lesson.id} 
                      className={`bg-gray-50 rounded-lg p-4 transition-all duration-300 ${
                        lesson.isCompleted ? 'border-l-4 border-success-color' : ''
                      }`}
                    >
                      <button
                        onClick={() => setActiveLesson(activeLesson === lesson.id ? null : lesson.id)}
                        className="w-full text-left"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            {lesson.isCompleted ? (
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-success-color/20 flex items-center justify-center">
                                <svg className="h-5 w-5 text-success-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{lesson.title}</h4>
                              <p className="text-xs text-gray-500">{lesson.xp} XP</p>
                            </div>
                          </div>
                          <svg
                            className={`h-5 w-5 text-gray-400 transform transition-transform duration-300 ${
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

                      <div className={`mt-4 transition-all duration-300 ${
                        activeLesson === lesson.id ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
                      }`}>
                        <p className="text-sm text-gray-500 mb-4">{lesson.description}</p>
                        
                        {lesson.unlockRequirements && (
                          <div className="mb-4 p-3 bg-warning-color/10 rounded-md">
                            <h5 className="text-sm font-medium text-warning-color mb-2">Requisitos para Desbloquear</h5>
                            <ul className="space-y-1">
                              {lesson.unlockRequirements.map(req => (
                                <li key={req.lessonId} className="text-sm text-gray-600 flex items-center space-x-2">
                                  <svg className="h-4 w-4 text-warning-color" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>
                                    Completar {MOCK_MODULES.find(m => 
                                      m.lessons.some(l => l.id === req.lessonId)
                                    )?.lessons.find(l => l.id === req.lessonId)?.title}
                                    {req.minimumScore && ` com nota mínima de ${req.minimumScore}%`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        <div className="grid gap-3">
                          {lesson.materials.map(material => (
                            <a
                              key={material.id}
                              href={material.url}
                              onMouseEnter={() => setHoveredMaterial(material.id)}
                              onMouseLeave={() => setHoveredMaterial(null)}
                              className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                                material.completed 
                                  ? 'bg-success-color/5 hover:bg-success-color/10' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                              } ${
                                hoveredMaterial === material.id ? 'transform scale-[1.02]' : ''
                              }`}
                            >
                              <div className={`flex-shrink-0 ${
                                hoveredMaterial === material.id ? 'scale-110' : ''
                              } transition-transform duration-300`}>
                                {getMaterialIcon(material.type)}
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                  <span className="text-xs font-medium text-warning-color">{material.xp} XP</span>
                                </div>
                                <div className="mt-1">
                                  {material.duration && (
                                    <p className="text-xs text-gray-500">Duração: {material.duration}</p>
                                  )}
                                  {material.dueDate && (
                                    <p className="text-xs text-gray-500">
                                      Entrega até: {new Date(material.dueDate).toLocaleDateString('pt-BR')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {material.completed && (
                                <svg className="h-5 w-5 text-success-color ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
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

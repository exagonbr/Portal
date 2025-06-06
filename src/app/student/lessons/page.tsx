'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Lesson {
  id: string
  title: string
  description: string
  course: string
  courseId: string
  module: string
  moduleId: string
  duration: number // em minutos
  videoUrl?: string
  materials: {
    id: string
    name: string
    type: 'pdf' | 'doc' | 'ppt' | 'video' | 'link'
    url: string
  }[]
  completed: boolean
  progress: number // 0-100
  order: number
  topics: string[]
}

interface Module {
  id: string
  name: string
  courseId: string
  lessons: Lesson[]
  totalDuration: number
  completedLessons: number
  totalLessons: number
}

export default function StudentLessonsPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      // Simular dados por enquanto
      const mockLessons: Lesson[] = [
        // Módulo 1 - Matemática
        {
          id: '1',
          title: 'Introdução às Equações',
          description: 'Conceitos básicos sobre equações matemáticas',
          course: 'Matemática Básica',
          courseId: '1',
          module: 'Módulo 1: Fundamentos',
          moduleId: 'mod1',
          duration: 45,
          videoUrl: 'https://example.com/video1',
          materials: [
            { id: 'm1', name: 'Apostila de Equações.pdf', type: 'pdf', url: '#' },
            { id: 'm2', name: 'Exercícios Práticos.doc', type: 'doc', url: '#' }
          ],
          completed: true,
          progress: 100,
          order: 1,
          topics: ['Conceitos básicos', 'Tipos de equações', 'Resolução']
        },
        {
          id: '2',
          title: 'Equações do 1º Grau',
          description: 'Aprendendo a resolver equações do primeiro grau',
          course: 'Matemática Básica',
          courseId: '1',
          module: 'Módulo 1: Fundamentos',
          moduleId: 'mod1',
          duration: 60,
          videoUrl: 'https://example.com/video2',
          materials: [
            { id: 'm3', name: 'Slides da Aula.ppt', type: 'ppt', url: '#' }
          ],
          completed: true,
          progress: 100,
          order: 2,
          topics: ['Propriedades', 'Métodos de resolução', 'Aplicações']
        },
        {
          id: '3',
          title: 'Equações do 2º Grau',
          description: 'Resolvendo equações quadráticas',
          course: 'Matemática Básica',
          courseId: '1',
          module: 'Módulo 2: Avançado',
          moduleId: 'mod2',
          duration: 75,
          videoUrl: 'https://example.com/video3',
          materials: [
            { id: 'm4', name: 'Fórmula de Bhaskara.pdf', type: 'pdf', url: '#' },
            { id: 'm5', name: 'Calculadora Online', type: 'link', url: '#' }
          ],
          completed: false,
          progress: 30,
          order: 3,
          topics: ['Fórmula de Bhaskara', 'Discriminante', 'Gráficos']
        },
        // Módulo 2 - Português
        {
          id: '4',
          title: 'Concordância Verbal',
          description: 'Regras de concordância entre sujeito e verbo',
          course: 'Português - Gramática',
          courseId: '2',
          module: 'Módulo 1: Gramática Essencial',
          moduleId: 'mod3',
          duration: 50,
          videoUrl: 'https://example.com/video4',
          materials: [
            { id: 'm6', name: 'Tabela de Concordância.pdf', type: 'pdf', url: '#' }
          ],
          completed: false,
          progress: 0,
          order: 1,
          topics: ['Sujeito simples', 'Sujeito composto', 'Casos especiais']
        }
      ]

      // Agrupar aulas por módulo
      const groupedModules: Module[] = []
      const moduleMap = new Map<string, Module>()

      mockLessons.forEach(lesson => {
        if (!moduleMap.has(lesson.moduleId)) {
          moduleMap.set(lesson.moduleId, {
            id: lesson.moduleId,
            name: lesson.module,
            courseId: lesson.courseId,
            lessons: [],
            totalDuration: 0,
            completedLessons: 0,
            totalLessons: 0
          })
        }

        const module = moduleMap.get(lesson.moduleId)!
        module.lessons.push(lesson)
        module.totalDuration += lesson.duration
        module.totalLessons++
        if (lesson.completed) {
          module.completedLessons++
        }
      })

      groupedModules.push(...Array.from(moduleMap.values()))
      setModules(groupedModules)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar aulas:', error)
      setLoading(false)
    }
  }

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const filteredModules = modules.filter(module => {
    const matchesCourse = selectedCourse === 'all' || module.courseId === selectedCourse
    const matchesSearch = searchTerm === '' || 
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.lessons.some(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    return matchesCourse && matchesSearch
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return 'picture_as_pdf'
      case 'doc': return 'description'
      case 'ppt': return 'slideshow'
      case 'video': return 'play_circle'
      case 'link': return 'link'
      default: return 'insert_drive_file'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const courses = Array.from(new Set(modules.map(m => m.courseId)))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
          Minhas Aulas
        </h1>
        <p style={{ color: theme.colors.text.secondary }}>
          Acesse o conteúdo das aulas e materiais de estudo
        </p>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: theme.colors.text.secondary }}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar aulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border transition-colors"
              style={{
                backgroundColor: theme.colors.background.card,
                borderColor: theme.colors.border.DEFAULT,
                color: theme.colors.text.primary
              }}
            />
          </div>
        </div>

        {/* Filtro por Curso */}
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 rounded-lg border"
          style={{
            backgroundColor: theme.colors.background.card,
            borderColor: theme.colors.border.DEFAULT,
            color: theme.colors.text.primary
          }}
        >
          <option value="all">Todos os Cursos</option>
          <option value="1">Matemática Básica</option>
          <option value="2">Português - Gramática</option>
          <option value="3">História do Brasil</option>
          <option value="4">Ciências Naturais</option>
        </select>
      </motion.div>

      {/* Módulos e Aulas */}
      <div className="space-y-4">
        {filteredModules.map((module, moduleIndex) => (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: moduleIndex * 0.1 }}
            className="rounded-lg shadow-md overflow-hidden"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            {/* Header do Módulo */}
            <button
              onClick={() => toggleModule(module.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-opacity-50 transition-colors"
              style={{ backgroundColor: theme.colors.background.secondary }}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl"
                      style={{ color: theme.colors.primary.DEFAULT }}>
                  {expandedModules.includes(module.id) ? 'expand_less' : 'expand_more'}
                </span>
                <div className="text-left">
                  <h3 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                    {module.name}
                  </h3>
                  <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                    {module.completedLessons}/{module.totalLessons} aulas concluídas • {formatDuration(module.totalDuration)}
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-32">
                <div className="w-full h-2 rounded-full overflow-hidden"
                     style={{ backgroundColor: theme.colors.border.light }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(module.completedLessons / module.totalLessons) * 100}%`,
                      backgroundColor: theme.colors.primary.DEFAULT
                    }}
                  />
                </div>
              </div>
            </button>

            {/* Aulas do Módulo */}
            {expandedModules.includes(module.id) && (
              <div className="border-t" style={{ borderColor: theme.colors.border.DEFAULT }}>
                {module.lessons.map((lesson, lessonIndex) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: lessonIndex * 0.05 }}
                    className="p-4 border-b last:border-b-0 hover:bg-opacity-50 transition-colors"
                    style={{ borderColor: theme.colors.border.light }}
                  >
                    <div className="flex items-start gap-4">
                      {/* Status/Progress */}
                      <div className="flex-shrink-0">
                        {lesson.completed ? (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center"
                               style={{ backgroundColor: theme.colors.status.success + '20' }}>
                            <span className="material-symbols-outlined text-xl"
                                  style={{ color: theme.colors.status.success }}>
                              check_circle
                            </span>
                          </div>
                        ) : lesson.progress > 0 ? (
                          <div className="w-10 h-10 rounded-full relative">
                            <svg className="w-10 h-10 transform -rotate-90">
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke={theme.colors.border.light}
                                strokeWidth="4"
                                fill="none"
                              />
                              <circle
                                cx="20"
                                cy="20"
                                r="16"
                                stroke={theme.colors.primary.DEFAULT}
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 16}`}
                                strokeDashoffset={`${2 * Math.PI * 16 * (1 - lesson.progress / 100)}`}
                                className="transition-all duration-500"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                                  style={{ color: theme.colors.text.primary }}>
                              {lesson.progress}%
                            </span>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center"
                               style={{ borderColor: theme.colors.border.DEFAULT }}>
                            <span className="material-symbols-outlined text-xl"
                                  style={{ color: theme.colors.text.tertiary }}>
                              play_circle
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1" style={{ color: theme.colors.text.primary }}>
                          Aula {lesson.order}: {lesson.title}
                        </h4>
                        <p className="text-sm mb-2" style={{ color: theme.colors.text.secondary }}>
                          {lesson.description}
                        </p>

                        {/* Info e Tópicos */}
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <span style={{ color: theme.colors.text.tertiary }}>
                            <span className="material-symbols-outlined text-base align-middle mr-1">
                              schedule
                            </span>
                            {formatDuration(lesson.duration)}
                          </span>
                          <span style={{ color: theme.colors.text.tertiary }}>
                            <span className="material-symbols-outlined text-base align-middle mr-1">
                              attach_file
                            </span>
                            {lesson.materials.length} materiais
                          </span>
                        </div>

                        {/* Tópicos */}
                        {lesson.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {lesson.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded text-xs"
                                style={{
                                  backgroundColor: theme.colors.background.secondary,
                                  color: theme.colors.text.secondary
                                }}
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Materiais */}
                        {lesson.materials.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {lesson.materials.map((material) => (
                              <a
                                key={material.id}
                                href={material.url}
                                className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm hover:shadow-md transition-all"
                                style={{
                                  backgroundColor: theme.colors.background.secondary,
                                  color: theme.colors.primary.DEFAULT
                                }}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {getTypeIcon(material.type)}
                                </span>
                                {material.name}
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex gap-2">
                          <Link
                            href={`/student/lessons/${lesson.id}`}
                            className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                            style={{
                              backgroundColor: lesson.completed ? 'transparent' : theme.colors.primary.DEFAULT,
                              color: lesson.completed ? theme.colors.primary.DEFAULT : 'white',
                              borderWidth: lesson.completed ? '1px' : '0',
                              borderColor: theme.colors.primary.DEFAULT
                            }}
                          >
                            {lesson.completed ? 'Revisar Aula' : lesson.progress > 0 ? 'Continuar Aula' : 'Iniciar Aula'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            school
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma aula encontrada
          </p>
        </motion.div>
      )}
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  progress: number
  totalLessons: number
  completedLessons: number
  nextLesson?: {
    id: string
    title: string
  }
  thumbnail?: string
  category: string
  duration: string
  status: 'active' | 'completed' | 'upcoming'
}

export default function StudentCoursesPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'upcoming'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      // Simular dados por enquanto
      const mockCourses: Course[] = [
        {
          id: '1',
          title: 'Matemática Básica',
          description: 'Fundamentos de matemática para o ensino fundamental',
          instructor: 'Prof. João Silva',
          progress: 75,
          totalLessons: 20,
          completedLessons: 15,
          nextLesson: { id: '16', title: 'Frações e Decimais' },
          category: 'Matemática',
          duration: '40 horas',
          status: 'active'
        },
        {
          id: '2',
          title: 'Português - Gramática',
          description: 'Regras gramaticais e produção textual',
          instructor: 'Prof. Maria Santos',
          progress: 45,
          totalLessons: 30,
          completedLessons: 13,
          nextLesson: { id: '14', title: 'Concordância Verbal' },
          category: 'Português',
          duration: '60 horas',
          status: 'active'
        },
        {
          id: '3',
          title: 'História do Brasil',
          description: 'Da colonização aos dias atuais',
          instructor: 'Prof. Carlos Oliveira',
          progress: 100,
          totalLessons: 25,
          completedLessons: 25,
          category: 'História',
          duration: '50 horas',
          status: 'completed'
        },
        {
          id: '4',
          title: 'Ciências Naturais',
          description: 'Biologia, Física e Química básicas',
          instructor: 'Prof. Ana Costa',
          progress: 0,
          totalLessons: 35,
          completedLessons: 0,
          category: 'Ciências',
          duration: '70 horas',
          status: 'upcoming'
        }
      ]
      
      setCourses(mockCourses)
      setLoading(false)
    } catch (error) {
      console.log('Erro ao buscar cursos:', error)
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.status === filter
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.colors.status.info
      case 'completed': return theme.colors.status.success
      case 'upcoming': return theme.colors.status.warning
      default: return theme.colors.text.secondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Em andamento'
      case 'completed': return 'Concluído'
      case 'upcoming': return 'Em breve'
      default: return status
    }
  }

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
          Meus Cursos
        </h1>
        <p style={{ color: theme.colors.text.secondary }}>
          Acompanhe seu progresso e acesse seus cursos
        </p>
      </motion.div>

      {/* Filtros e Busca */}
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
              placeholder="Buscar cursos..."
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

        {/* Filtros */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'upcoming'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: filter === status ? theme.colors.primary.DEFAULT : theme.colors.background.card,
                color: filter === status ? 'white' : theme.colors.text.secondary,
                borderWidth: '1px',
                borderColor: filter === status ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT
              }}
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            {/* Thumbnail */}
            <div className="h-48 relative overflow-hidden"
                 style={{ backgroundColor: theme.colors.primary.light + '20' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl"
                      style={{ color: theme.colors.primary.DEFAULT }}>
                  school
                </span>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getStatusColor(course.status) + '20',
                        color: getStatusColor(course.status)
                      }}>
                  {getStatusLabel(course.status)}
                </span>
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors.text.primary }}>
                {course.title}
              </h3>
              <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.colors.text.secondary }}>
                {course.description}
              </p>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.text.secondary }}>
                  <span className="material-symbols-outlined text-base">person</span>
                  {course.instructor}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.text.secondary }}>
                  <span className="material-symbols-outlined text-base">schedule</span>
                  {course.duration}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.text.secondary }}>
                  <span className="material-symbols-outlined text-base">category</span>
                  {course.category}
                </div>
              </div>

              {/* Progress */}
              {course.status === 'active' && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                      Progresso
                    </span>
                    <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                      {course.completedLessons}/{course.totalLessons} aulas
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden"
                       style={{ backgroundColor: theme.colors.border.light }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                    />
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2">
                {course.status === 'active' && (
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-center transition-colors"
                    style={{
                      backgroundColor: theme.colors.primary.DEFAULT,
                      color: 'white'
                    }}
                  >
                    Continuar
                  </Link>
                )}
                {course.status === 'completed' && (
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-center transition-colors border"
                    style={{
                      borderColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primary.DEFAULT
                    }}
                  >
                    Revisar
                  </Link>
                )}
                {course.status === 'upcoming' && (
                  <button
                    disabled
                    className="flex-1 py-2 px-4 rounded-lg font-medium text-center cursor-not-allowed"
                    style={{
                      backgroundColor: theme.colors.background.secondary,
                      color: theme.colors.text.tertiary
                    }}
                  >
                    Em breve
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
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
            Nenhum curso encontrado
          </p>
        </motion.div>
      )}
    </div>
  )
} 
'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Table from '@/components/ui/Table'
import { motion } from 'framer-motion'

interface Grade {
  id: string
  activity_name: string
  activity_type: 'assignment' | 'quiz' | 'project' | 'exam'
  course_name: string
  class_name: string
  points_earned: number
  points_possible: number
  percentage: number
  grade_letter: string
  graded_at: string
  feedback?: string
}

interface CourseGrades {
  course_id: string
  course_name: string
  class_name: string
  current_grade: number
  grade_letter: string
  credits: number
  grades: Grade[]
}

// Mock data
const mockCourseGrades: CourseGrades[] = [
  {
    course_id: '1',
    course_name: 'Desenvolvimento Web',
    class_name: 'Turma A - 2024',
    current_grade: 85.5,
    grade_letter: 'B',
    credits: 4,
    grades: [
      {
        id: '1',
        activity_name: 'Trabalho 1 - HTML/CSS',
        activity_type: 'assignment',
        course_name: 'Desenvolvimento Web',
        class_name: 'Turma A - 2024',
        points_earned: 90,
        points_possible: 100,
        percentage: 90,
        grade_letter: 'A',
        graded_at: '2024-02-15',
        feedback: 'Excelente trabalho! Ótimo uso de flexbox e grid.'
      },
      {
        id: '2',
        activity_name: 'Quiz - JavaScript Básico',
        activity_type: 'quiz',
        course_name: 'Desenvolvimento Web',
        class_name: 'Turma A - 2024',
        points_earned: 40,
        points_possible: 50,
        percentage: 80,
        grade_letter: 'B',
        graded_at: '2024-02-20'
      },
      {
        id: '3',
        activity_name: 'Projeto Final',
        activity_type: 'project',
        course_name: 'Desenvolvimento Web',
        class_name: 'Turma A - 2024',
        points_earned: 180,
        points_possible: 200,
        percentage: 90,
        grade_letter: 'A',
        graded_at: '2024-03-10',
        feedback: 'Projeto muito bem estruturado. Parabéns!'
      }
    ]
  },
  {
    course_id: '2',
    course_name: 'Banco de Dados',
    class_name: 'Turma C - 2024',
    current_grade: 78.3,
    grade_letter: 'C',
    credits: 3,
    grades: [
      {
        id: '4',
        activity_name: 'Prova 1 - SQL',
        activity_type: 'exam',
        course_name: 'Banco de Dados',
        class_name: 'Turma C - 2024',
        points_earned: 75,
        points_possible: 100,
        percentage: 75,
        grade_letter: 'C',
        graded_at: '2024-02-25'
      },
      {
        id: '5',
        activity_name: 'Trabalho - Modelagem',
        activity_type: 'assignment',
        course_name: 'Banco de Dados',
        class_name: 'Turma C - 2024',
        points_earned: 85,
        points_possible: 100,
        percentage: 85,
        grade_letter: 'B',
        graded_at: '2024-03-05'
      }
    ]
  }
]

export default function StudentGradesPage() {
  const { theme } = useTheme()
  const [courseGrades] = useState<CourseGrades[]>(mockCourseGrades)
  const [selectedCourse, setSelectedCourse] = useState<string>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current')

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return theme.colors.status.success
    if (percentage >= 80) return theme.colors.status.info
    if (percentage >= 70) return theme.colors.status.warning
    return theme.colors.status.error
  }

  const getActivityIcon = (type: Grade['activity_type']) => {
    const icons = {
      assignment: 'assignment',
      quiz: 'quiz',
      project: 'folder_special',
      exam: 'school'
    }
    return icons[type] || 'task'
  }

  const calculateGPA = () => {
    const gradePoints: Record<string, number> = {
      'A': 4.0,
      'B': 3.0,
      'C': 2.0,
      'D': 1.0,
      'F': 0.0
    }

    let totalPoints = 0
    let totalCredits = 0

    courseGrades.forEach(course => {
      const points = gradePoints[course.grade_letter] || 0
      totalPoints += points * course.credits
      totalCredits += course.credits
    })

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00'
  }

  const filteredCourses = selectedCourse === 'all' 
    ? courseGrades 
    : courseGrades.filter(c => c.course_id === selectedCourse)

  const courseOptions = [
    { value: 'all', label: 'Todos os Cursos' },
    ...courseGrades.map(c => ({ value: c.course_id, label: c.course_name }))
  ]

  const periodOptions = [
    { value: 'current', label: 'Período Atual' },
    { value: '2024-1', label: '2024/1' },
    { value: '2023-2', label: '2023/2' },
    { value: '2023-1', label: '2023/1' }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.STUDENT]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Minhas Notas"
          subtitle="Acompanhe seu desempenho acadêmico"
        >
          {/* GPA and Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card gradient>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    Média Geral (GPA)
                  </h3>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.primary.DEFAULT }}>
                    grade
                  </span>
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: theme.colors.primary.DEFAULT }}>
                  {calculateGPA()}
                </div>
                <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  de 4.00 possíveis
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    Cursos Ativos
                  </h3>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.secondary.DEFAULT }}>
                    school
                  </span>
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
                  {courseGrades.length}
                </div>
                <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  {courseGrades.reduce((acc, c) => acc + c.credits, 0)} créditos totais
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                    Média do Período
                  </h3>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.accent.DEFAULT }}>
                    trending_up
                  </span>
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
                  {(courseGrades.reduce((acc, c) => acc + c.current_grade, 0) / courseGrades.length).toFixed(1)}%
                </div>
                <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                  Desempenho geral
                </p>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Select
              value={selectedCourse}
              onChange={setSelectedCourse}
              options={courseOptions}
              className="w-64"
            />
            <Select
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={periodOptions}
              className="w-48"
            />
          </div>

          {/* Course Grades */}
          <div className="space-y-6">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course.course_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-1" style={{ color: theme.colors.text.primary }}>
                          {course.course_name}
                        </h3>
                        <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                          {course.class_name} • {course.credits} créditos
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: getGradeColor(course.current_grade) }}>
                          {course.current_grade.toFixed(1)}%
                        </div>
                        <div className="text-lg font-medium" style={{ color: theme.colors.text.secondary }}>
                          Nota: {course.grade_letter}
                        </div>
                      </div>
                    </div>

                    <Table
                      columns={[
                        {
                          key: 'activity',
                          title: 'Atividade',
                          render: (grade: Grade) => (
                            <div className="flex items-center gap-3">
                              <span 
                                className="material-symbols-outlined"
                                style={{ color: theme.colors.text.secondary }}
                              >
                                {getActivityIcon(grade.activity_type)}
                              </span>
                              <span style={{ color: theme.colors.text.primary }}>
                                {grade.activity_name}
                              </span>
                            </div>
                          )
                        },
                        {
                          key: 'grade',
                          title: 'Nota',
                          render: (grade: Grade) => (
                            <div>
                              <span className="font-medium" style={{ color: theme.colors.text.primary }}>
                                {grade.points_earned}/{grade.points_possible}
                              </span>
                              <span className="ml-2 text-sm" style={{ color: getGradeColor(grade.percentage) }}>
                                ({grade.percentage}%)
                              </span>
                            </div>
                          )
                        },
                        {
                          key: 'letter',
                          title: 'Conceito',
                          render: (grade: Grade) => (
                            <span 
                              className="font-bold text-lg"
                              style={{ color: getGradeColor(grade.percentage) }}
                            >
                              {grade.grade_letter}
                            </span>
                          )
                        },
                        {
                          key: 'date',
                          title: 'Data',
                          render: (grade: Grade) => (
                            <span style={{ color: theme.colors.text.secondary }}>
                              {new Date(grade.graded_at).toLocaleDateString('pt-BR')}
                            </span>
                          )
                        },
                        {
                          key: 'actions',
                          title: '',
                          render: (grade: Grade) => (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {}}
                            >
                              {grade.feedback ? (
                                <span className="material-symbols-outlined">comment</span>
                              ) : (
                                <span className="material-symbols-outlined">visibility</span>
                              )}
                            </Button>
                          )
                        }
                      ]}
                      data={course.grades}
                      size="sm"
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 
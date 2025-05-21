'use client'

import { useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { mockTeachers, mockCourses, mockStudents, mockLiveClasses, mockAssignments } from '../../../constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import LessonPlanManager from '../../../components/LessonPlanManager'
import ClassGroupManager from '../../../components/ClassGroupManager'
import { BRAZILIAN_EDUCATION } from '../../../constants/brazilianEducation'
import { LessonPlan, ClassGroup } from '../../../types/brazilianEducation'

type TabType = 'overview' | 'lesson-plans' | 'class-groups'

export default function TeacherDashboard() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedLevel, setSelectedLevel] = useState<keyof typeof BRAZILIAN_EDUCATION | ''>('')

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user || user.type !== 'teacher') {
    redirect('/login')
  }

  const teacher = mockTeachers.find(t => t.id === user.id)
  const teacherCourses = mockCourses.filter(course => teacher?.courses.includes(course.id))
  const upcomingClasses = mockLiveClasses.filter(
    liveClass => teacher?.courses.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  )
  const activeAssignments = mockAssignments.filter(
    assignment => teacher?.courses.includes(assignment.courseId) && assignment.status === 'active'
  )
  const teacherStudents = mockStudents.filter(student => 
    student.enrolledCourses.some(courseId => teacher?.courses.includes(courseId))
  )

  const handleSaveLessonPlan = (plan: LessonPlan) => {
    // Here you would typically save the lesson plan to your backend
    console.log('Saving lesson plan:', plan)
    // You could show a success message here
  }

  const handleSaveClassGroup = (classGroup: ClassGroup) => {
    // Here you would typically save the class group to your backend
    console.log('Saving class group:', classGroup)
    // You could show a success message here
  }

  const filterStudentsByLevel = (level: keyof typeof BRAZILIAN_EDUCATION) => {
    // This would typically filter students based on their educational level
    // For now, we'll just return all students
    return teacherStudents
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Portal do Professor</h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`nav-link block w-full text-left ${activeTab === 'overview' ? 'active' : ''}`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('lesson-plans')}
            className={`nav-link block w-full text-left ${activeTab === 'lesson-plans' ? 'active' : ''}`}
          >
            Planos de Aula
          </button>
          <button 
            onClick={() => setActiveTab('class-groups')}
            className={`nav-link block w-full text-left ${activeTab === 'class-groups' ? 'active' : ''}`}
          >
            Turmas
          </button>
          <Link href="/courses" className="nav-link block">Meus Cursos</Link>
          <Link href="/students" className="nav-link block">Alunos</Link>
          <Link href="/assignments" className="nav-link block">Atividades</Link>
          <Link href="/live" className="nav-link block">Aulas ao Vivo</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1B365D]">
            {activeTab === 'overview' && 'Visão Geral'}
            {activeTab === 'lesson-plans' && 'Planos de Aula'}
            {activeTab === 'class-groups' && 'Gerenciamento de Turmas'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button className="btn-secondary">Sair</button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Educational Levels Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Nível de Ensino</label>
              <select
                className="w-full md:w-64 rounded-md border-gray-300 shadow-sm focus:border-[#1B365D] focus:ring-[#1B365D]"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as keyof typeof BRAZILIAN_EDUCATION)}
              >
                <option value="">Todos os níveis</option>
                {Object.entries(BRAZILIAN_EDUCATION).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-[#1B365D]">Cursos</h3>
                <p className="text-2xl font-bold text-[#1B365D]">{teacherCourses.length}</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-[#1B365D]">Alunos</h3>
                <p className="text-2xl font-bold text-[#1B365D]">
                  {selectedLevel ? filterStudentsByLevel(selectedLevel as keyof typeof BRAZILIAN_EDUCATION).length : teacherStudents.length}
                </p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-[#1B365D]">Aulas Agendadas</h3>
                <p className="text-2xl font-bold text-[#1B365D]">{upcomingClasses.length}</p>
              </div>
              <div className="card">
                <h3 className="text-lg font-semibold text-[#1B365D]">Atividades Ativas</h3>
                <p className="text-2xl font-bold text-[#1B365D]">{activeAssignments.length}</p>
              </div>
            </div>

            {/* Upcoming Classes */}
            <div className="card mb-8">
              <h2 className="section-title">Próximas Aulas</h2>
              <div className="space-y-4">
                {upcomingClasses.map(liveClass => (
                  <div key={liveClass.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{liveClass.title}</h3>
                        <p className="text-sm text-gray-600">
                          {liveClass.date} • {liveClass.time}
                        </p>
                        {liveClass.description && (
                          <p className="text-sm text-gray-600 mt-1">{liveClass.description}</p>
                        )}
                      </div>
                      <Link href={liveClass.meetingUrl} className="btn-primary">
                        Entrar
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Overview */}
            <div className="card">
              <h2 className="section-title">Visão Geral dos Alunos</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-[#F7FAFC]">
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                        Progresso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                        Média
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(selectedLevel ? filterStudentsByLevel(selectedLevel as keyof typeof BRAZILIAN_EDUCATION) : teacherStudents).map(student => {
                      const averageGrade = (
                        (student.grades.assignments + student.grades.tests + student.grades.participation) / 3
                      ).toFixed(1)

                      return (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-[#1B365D]">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-[#1B365D] h-2.5 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{student.progress}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {averageGrade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              href={`/students/${student.id}`}
                              className="text-[#1B365D] hover:text-[#2A4C80]"
                            >
                              Ver detalhes
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'lesson-plans' && (
          <LessonPlanManager teacherId={user.id} onSave={handleSaveLessonPlan} />
        )}

        {activeTab === 'class-groups' && (
          <ClassGroupManager teacherId={user.id} onSave={handleSaveClassGroup} />
        )}
      </main>
    </div>
  )
}

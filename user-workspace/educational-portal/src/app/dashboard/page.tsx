'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import StudentProgress from '../../components/StudentProgress'
import CourseCard from '../../components/CourseCard'
import { mockCourses, mockLiveClasses, Course } from '../../constants/mockData'

const TeacherDashboard = () => {
  const teacherCourses = mockCourses;
  const upcomingClasses = mockLiveClasses;

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Total de Alunos</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {teacherCourses.reduce((acc, course) => acc + course.students.length, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Turmas Ativas</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{teacherCourses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Próximas Aulas</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{upcomingClasses.length}</p>
        </div>
      </section>

      {/* Upcoming Classes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximas Aulas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {upcomingClasses.map((class_) => (
              <div key={class_.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{class_.title}</h3>
                    <p className="text-sm text-gray-500">
                      {class_.date} • {class_.time}
                    </p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => window.open(class_.meetingUrl, '_blank')}
                  >
                    Iniciar Aula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Classes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Minhas Turmas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teacherCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={true}
              onViewDetails={() => {}}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

const StudentDashboard = () => {
  const studentCourses = mockCourses;
  const studentId = 's1'; // Mock student ID

  const calculateOverallProgress = (courses: Course[]) => {
    const totalProgress = courses.reduce((acc, course) => {
      const student = course.students.find(s => s.id === studentId);
      return acc + (student?.progress || 0);
    }, 0);
    return totalProgress / courses.length;
  };

  return (
    <div className="space-y-8">
      {/* Progress Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Progresso Geral</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Math.round(calculateOverallProgress(studentCourses))}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Cursos Ativos</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{studentCourses.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900">Próximas Aulas</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{mockLiveClasses.length}</p>
        </div>
      </section>

      {/* My Courses */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Meus Cursos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={true}
              onViewDetails={() => {}}
            />
          ))}
        </div>
      </section>

      {/* Upcoming Classes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Próximas Aulas</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {mockLiveClasses.map((class_) => (
              <div key={class_.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{class_.title}</h3>
                    <p className="text-sm text-gray-500">
                      {class_.date} • {class_.time}
                    </p>
                  </div>
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => window.open(class_.meetingUrl, '_blank')}
                  >
                    Entrar na Aula
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
        <p className="mt-2 text-gray-600">Faça login para acessar o dashboard</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo, {user.name}!
        </h1>
        <p className="mt-2 text-gray-600">
          {user.type === 'teacher' 
            ? 'Gerencie suas turmas e acompanhe o progresso dos alunos'
            : 'Continue seus estudos de onde parou'
          }
        </p>
      </header>

      {user.type === 'teacher' ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  )
}

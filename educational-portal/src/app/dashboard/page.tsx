'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockTeachers, mockCourses, mockStudents, mockLiveClasses, mockAssignments } from '@/constants/mockData'
import Link from 'next/link'
import { User } from '@/types/auth'

export default function Dashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Please log in to access the dashboard.</p>
      </div>
    )
  }

  if (user.type === 'teacher') {
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

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard do Professor</h1>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Cursos</h3>
            <p className="text-2xl font-bold text-blue-600">{teacherCourses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Alunos</h3>
            <p className="text-2xl font-bold text-blue-600">{teacherStudents.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Aulas Agendadas</h3>
            <p className="text-2xl font-bold text-blue-600">{upcomingClasses.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Atividades Ativas</h3>
            <p className="text-2xl font-bold text-blue-600">{activeAssignments.length}</p>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Próximas Aulas</h2>
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
                  <Link
                    href={liveClass.meetingUrl}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Entrar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Assignments */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Atividades Ativas</h2>
          <div className="space-y-4">
            {activeAssignments.map(assignment => (
              <div key={assignment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {assignment.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Overview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Visão Geral dos Alunos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teacherStudents.map(student => {
                  const averageGrade = (
                    (student.grades.assignments + student.grades.tests + student.grades.participation) / 3
                  ).toFixed(1)

                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
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
                          className="text-blue-600 hover:text-blue-900"
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
      </div>
    )
  }

  // Student Dashboard
  const studentCourses = mockCourses.filter(course => user.courses?.includes(course.id))
  const studentAssignments = mockAssignments.filter(
    assignment => user.courses?.includes(assignment.courseId) && assignment.status === 'active'
  )
  const studentClasses = mockLiveClasses.filter(
    liveClass => user.courses?.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  )
  const student = mockStudents.find(s => s.id === user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard do Aluno</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Progresso Geral</h3>
          <p className="text-2xl font-bold text-blue-600">{student?.progress}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Cursos Ativos</h3>
          <p className="text-2xl font-bold text-blue-600">{studentCourses.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Atividades Pendentes</h3>
          <p className="text-2xl font-bold text-blue-600">{studentAssignments.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Próximas Aulas</h3>
          <p className="text-2xl font-bold text-blue-600">{studentClasses.length}</p>
        </div>
      </div>

      {/* Courses Progress */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Meus Cursos</h2>
        <div className="space-y-4">
          {studentCourses.map(course => (
            <div key={course.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{course.name}</h3>
                  <p className="text-sm text-gray-600">{course.description}</p>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Acessar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Classes */}
      <div className="bg-white rounded-lg shadow mb-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Próximas Aulas</h2>
        <div className="space-y-4">
          {studentClasses.map(liveClass => (
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
                <Link
                  href={liveClass.meetingUrl}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Entrar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Atividades Pendentes</h2>
        <div className="space-y-4">
          {studentAssignments.map(assignment => (
            <div key={assignment.id} className="border-b pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-gray-600">
                    Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                </div>
                <Link
                  href={`/assignments/${assignment.id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Iniciar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

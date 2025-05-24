'use client'

import { useAuth } from "../../../contexts/AuthContext"
import { mockCourses, mockStudents, mockLiveClasses, mockAssignments } from "../../../constants/mockData"
import Link from "next/link"

export default function StudentDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in AuthenticatedLayout
  }

  const studentCourses = mockCourses.filter(course => user?.courses?.includes(course.id))
  const studentAssignments = mockAssignments.filter(
    assignment => user?.courses?.includes(assignment.courseId) && assignment.status === 'active'
  )
  const studentClasses = mockLiveClasses.filter(
    liveClass => user?.courses?.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  )
  const student = mockStudents.find(s => s.id === user?.id)

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard do Aluno</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="relative">
            <div className="text-3xl font-bold mb-2">{student?.progress}%</div>
            <div className="text-sm font-medium opacity-90">Progresso Geral</div>
            <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${student?.progress}%` }}
              />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-3xl font-bold mb-2">{studentCourses.length}</div>
          <div className="text-sm font-medium opacity-90">Cursos Ativos</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-warning to-yellow-400 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-3xl font-bold mb-2">{studentAssignments.length}</div>
          <div className="text-sm font-medium opacity-90">Atividades Pendentes</div>
        </div>
        <div className="p-6 rounded-2xl bg-gradient-to-br from-info to-blue-400 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-3xl font-bold mb-2">{studentClasses.length}</div>
          <div className="text-sm font-medium opacity-90">Próximas Aulas</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Progress */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-border">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
            <h2 className="text-xl font-bold text-text-primary">Meus Cursos</h2>
          </div>
          <div className="p-6 space-y-4">
            {studentCourses.length === 0 ? (
              <p className="text-text-secondary text-center py-4">Nenhum curso ativo</p>
            ) : (
              studentCourses.map(course => (
                <div key={course.id} className="p-4 rounded-xl bg-background-start hover:bg-background-end transition-all duration-300 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-text-primary">{course.name}</h3>
                      <p className="text-sm text-text-secondary mt-1">{course.description}</p>
                    </div>
                    <Link 
                      href={`/courses/${course.id}`} 
                      className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors duration-300"
                    >
                      Acessar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-border">
          <div className="p-6 border-b border-border bg-gradient-to-r from-info/10 to-transparent">
            <h2 className="text-xl font-bold text-text-primary">Próximas Aulas</h2>
          </div>
          <div className="p-6 space-y-4">
            {studentClasses.length === 0 ? (
              <p className="text-text-secondary text-center py-4">Nenhuma aula agendada</p>
            ) : (
              studentClasses.map(liveClass => (
                <div key={liveClass.id} className="p-4 rounded-xl bg-background-start hover:bg-background-end transition-all duration-300 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-text-primary">{liveClass.title}</h3>
                      <p className="text-sm text-info font-medium mt-1">
                        {liveClass.date} • {liveClass.time}
                      </p>
                      {liveClass.description && (
                        <p className="text-sm text-text-secondary mt-1">{liveClass.description}</p>
                      )}
                    </div>
                    <Link 
                      href={liveClass.meetingUrl} 
                      className="px-4 py-2 rounded-lg bg-info text-white text-sm font-medium hover:bg-blue-600 transition-colors duration-300"
                    >
                      Entrar
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Assignments */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-border">
        <div className="p-6 border-b border-border bg-gradient-to-r from-warning/10 to-transparent">
          <h2 className="text-xl font-bold text-text-primary">Atividades Pendentes</h2>
        </div>
        <div className="p-6">
          {studentAssignments.length === 0 ? (
            <p className="text-text-secondary text-center py-4">Nenhuma atividade pendente</p>
          ) : (
            <div className="space-y-4">
              {studentAssignments.map(assignment => (
                <div key={assignment.id} className="p-4 rounded-xl bg-background-start hover:bg-background-end transition-all duration-300 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-text-primary">{assignment.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                          Pendente
                        </span>
                      </div>
                      <p className="text-sm text-warning font-medium mt-1">
                        Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                      </p>
                      <p className="text-sm text-text-secondary mt-1">{assignment.description}</p>
                    </div>
                    <Link 
                      href={`/assignments/${assignment.id}`} 
                      className="px-4 py-2 rounded-lg bg-warning text-white text-sm font-medium hover:bg-yellow-500 transition-colors duration-300"
                    >
                      Iniciar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

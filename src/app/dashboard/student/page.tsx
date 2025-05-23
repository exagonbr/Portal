'use client';

import { useAuth } from "../../../contexts/AuthContext";
import { mockCourses, mockStudents, mockLiveClasses, mockAssignments } from "../../../constants/mockData";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in AuthenticatedLayout
  }

  const studentCourses = mockCourses.filter(course => user?.courses?.includes(course.id));
  const studentAssignments = mockAssignments.filter(
    assignment => user?.courses?.includes(assignment.courseId) && assignment.status === 'active'
  );
  const studentClasses = mockLiveClasses.filter(
    liveClass => user?.courses?.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  );
  const student = mockStudents.find(s => s.id === user?.id);

  return (
    <div className="flex min-h-screen bg-background-start">
      <aside className="w-64 bg-white shadow-lg border-r border-border">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-primary mb-2">Portal do Aluno</h2>
          <p className="text-sm text-text-secondary">{user?.name}</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link 
            href="/dashboard/student" 
            className="flex items-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-light text-white font-medium shadow-md hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link 
            href="/courses" 
            className="flex items-center px-4 py-3 rounded-xl text-text-primary hover:bg-background-end transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Meus Cursos
          </Link>
          <Link 
            href="/assignments" 
            className="flex items-center px-4 py-3 rounded-xl text-text-primary hover:bg-background-end transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Atividades
          </Link>
          <Link 
            href="/live" 
            className="flex items-center px-4 py-3 rounded-xl text-text-primary hover:bg-background-end transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Aulas ao Vivo
          </Link>
          <Link 
            href="/chat" 
            className="flex items-center px-4 py-3 rounded-xl text-text-primary hover:bg-background-end transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-3 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          </header>

          {/* Quick Stats */}
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
      </main>
    </div>
  );
}

'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockLiveClasses, mockCourses, mockTeachers, mockStudents } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function LiveClasses() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
  }

  let userClasses = []
  if (user.type === 'teacher') {
    const teacher = mockTeachers.find(t => t.id === user.id)
    const teacherCourses = teacher?.courses || []
    userClasses = mockLiveClasses.filter(liveClass =>
      teacherCourses.includes(liveClass.courseId)
    )
  } else {
    const student = mockStudents.find(s => s.id === user.id)
    const studentCourses = student?.enrolledCourses || []
    userClasses = mockLiveClasses.filter(liveClass =>
      studentCourses.includes(liveClass.courseId)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada'
      case 'in-progress':
        return 'Em Andamento'
      case 'completed':
        return 'Concluída'
      default:
        return status
    }
  }

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">
            Portal do {user.type === 'teacher' ? 'Professor' : 'Aluno'}
          </h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <Link href={`/dashboard/${user.type}`} className="nav-link block">
            Dashboard
          </Link>
          <Link href="/courses" className="nav-link block">
            Cursos
          </Link>
          {user.type === 'teacher' && (
            <Link href="/students" className="nav-link block">
              Alunos
            </Link>
          )}
          <Link href="/assignments" className="nav-link block">
            Atividades
          </Link>
          <Link href="/live" className="nav-link active block">
            Aulas ao Vivo
          </Link>
          {user.type === 'student' && (
            <Link href="/chat" className="nav-link block">
              Chat
            </Link>
          )}
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1B365D]">Aulas ao Vivo</h1>
          {user.type === 'teacher' && (
            <button className="btn-primary">Agendar Nova Aula</button>
          )}
        </header>

        <div className="space-y-6 mt-6">
          {userClasses.length === 0 ? (
            <p className="text-gray-600">Nenhuma aula ao vivo encontrada.</p>
          ) : (
            userClasses.map(liveClass => {
              const course = mockCourses.find(c => c.id === liveClass.courseId)
              return (
                <div key={liveClass.id} className="card hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-[#1B365D] mb-2">
                          {liveClass.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">
                          Curso: {course?.name}
                        </p>
                        <p className="text-gray-600 text-sm mb-2">
                          Data: {liveClass.date} • Horário: {liveClass.time}
                        </p>
                        {liveClass.description && (
                          <p className="text-gray-600 text-sm mb-4">{liveClass.description}</p>
                        )}
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(liveClass.status)}`}>
                          {getStatusText(liveClass.status)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {liveClass.status !== 'completed' && (
                          <Link href={liveClass.meetingUrl} className="btn-primary">
                            {liveClass.status === 'in-progress' ? 'Entrar' : 'Acessar'}
                          </Link>
                        )}
                        {user.type === 'teacher' && (
                          <button className="btn-secondary">
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                    {liveClass.materials && liveClass.materials.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold text-[#1B365D] mb-2">
                          Materiais da Aula
                        </h4>
                        <div className="space-y-2">
                          {liveClass.materials.map(materialId => (
                            <Link
                              key={materialId}
                              href={`/materials/${materialId}`}
                              className="material-item"
                            >
                              <span className="text-sm text-[#1B365D]">
                                Material {materialId}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}

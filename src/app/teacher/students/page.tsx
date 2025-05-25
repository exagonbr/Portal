'use client'

import { useAuth } from '@/contexts/AuthContext'

interface Student {
  id: number
  name: string
  email: string
  registration: string
  course: string
  status: 'active' | 'inactive'
  avatar: string
  attendance: number
  grade: number
  lastActivity: string
  enrollmentDate: string
  class: string
}

const MOCK_STUDENTS: Student[] = [
  {
    id: 1,
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    registration: '2024001',
    course: 'Matemática Avançada',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=1',
    attendance: 92,
    grade: 8.5,
    lastActivity: '2024-01-15',
    enrollmentDate: '2024-01-01',
    class: 'Turma A'
  },
  {
    id: 2,
    name: 'Pedro Santos',
    email: 'pedro.santos@email.com',
    registration: '2024002',
    course: 'Matemática Avançada',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=2',
    attendance: 88,
    grade: 7.8,
    lastActivity: '2024-01-14',
    enrollmentDate: '2024-01-01',
    class: 'Turma A'
  },
  {
    id: 3,
    name: 'Maria Costa',
    email: 'maria.costa@email.com',
    registration: '2024003',
    course: 'Matemática Avançada',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=3',
    attendance: 95,
    grade: 9.2,
    lastActivity: '2024-01-15',
    enrollmentDate: '2024-01-01',
    class: 'Turma B'
  },
  {
    id: 4,
    name: 'João Oliveira',
    email: 'joao.oliveira@email.com',
    registration: '2024004',
    course: 'Matemática Avançada',
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=4',
    attendance: 65,
    grade: 6.5,
    lastActivity: '2024-01-10',
    enrollmentDate: '2024-01-01',
    class: 'Turma B'
  },
  {
    id: 5,
    name: 'Carla Souza',
    email: 'carla.souza@email.com',
    registration: '2024005',
    course: 'Matemática Avançada',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=5',
    attendance: 98,
    grade: 9.8,
    lastActivity: '2024-01-15',
    enrollmentDate: '2024-01-01',
    class: 'Turma A'
  },
  {
    id: 6,
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    registration: '2024006',
    course: 'Matemática Avançada',
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=6',
    attendance: 85,
    grade: 7.5,
    lastActivity: '2024-01-13',
    enrollmentDate: '2024-01-01',
    class: 'Turma B'
  }
]

const STATUS_COLORS = {
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ativo' },
  inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inativo' }
}

export default function TeacherStudentsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Alunos</h1>
            <p className="text-gray-600">Gerencie e acompanhe o desempenho dos seus alunos</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <span className="material-icons text-sm mr-2">file_download</span>
              Exportar
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <span className="material-icons text-sm mr-2">person_add</span>
              Adicionar Aluno
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Alunos</div>
            <div className="text-2xl font-bold text-gray-800">126</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 12</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média de Notas</div>
            <div className="text-2xl font-bold text-blue-600">8.2</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.3</span>
              <span className="text-gray-500 text-sm ml-2">vs. semestre anterior</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Frequência Média</div>
            <div className="text-2xl font-bold text-green-600">92%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Alunos em Risco</div>
            <div className="text-2xl font-bold text-red-600">8</div>
            <div className="mt-4 flex items-center">
              <span className="text-red-500 text-sm">Requer atenção</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Pesquisar alunos..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas as Turmas</option>
            <option value="A">Turma A</option>
            <option value="B">Turma B</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
          <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Ordenar por</option>
            <option value="name">Nome</option>
            <option value="grade">Nota</option>
            <option value="attendance">Frequência</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_STUDENTS.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Student Card Header */}
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="absolute -bottom-10 left-6">
                <img
                  src={student.avatar}
                  alt={student.name}
                  className="w-20 h-20 rounded-full border-4 border-white"
                />
              </div>
            </div>

            {/* Student Info */}
            <div className="pt-12 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
                <span className={`px-3 py-1 ${STATUS_COLORS[student.status].bg} ${STATUS_COLORS[student.status].text} rounded-full text-sm`}>
                  {STATUS_COLORS[student.status].label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Matrícula</p>
                  <p className="font-medium">{student.registration}</p>
                </div>
                <div>
                  <p className="text-gray-500">Turma</p>
                  <p className="font-medium">{student.class}</p>
                </div>
                <div>
                  <p className="text-gray-500">Frequência</p>
                  <p className={`font-medium ${student.attendance >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                    {student.attendance}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Nota Média</p>
                  <p className={`font-medium ${student.grade >= 7 ? 'text-green-600' : 'text-red-600'}`}>
                    {student.grade.toFixed(1)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Última atividade: {new Date(student.lastActivity).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button className="text-gray-600 hover:text-gray-800">
                  <span className="material-icons">more_vert</span>
                </button>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                    Ver Detalhes
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Enviar Mensagem
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

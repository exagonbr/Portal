'use client'

import { useAuth } from '@/contexts/AuthContext'

const MOCK_COURSES = [
  {
    id: 1,
    name: 'Matemática Avançada',
    description: 'Curso completo de cálculo diferencial e integral, álgebra linear e geometria analítica',
    image: '/math.jpg',
    progress: 75,
    instructor: 'Dr. João Silva',
    duration: '60 horas',
    enrolled: 234,
    rating: 4.8,
    category: 'Exatas'
  },
  {
    id: 2,
    name: 'Física Fundamental',
    description: 'Fundamentos de mecânica clássica, termodinâmica e eletromagnetismo',
    image: '/physics.jpg',
    progress: 45,
    instructor: 'Dra. Maria Santos',
    duration: '48 horas',
    enrolled: 189,
    rating: 4.6,
    category: 'Exatas'
  },
  {
    id: 3,
    name: 'Química Orgânica',
    description: 'Estudo das estruturas, propriedades e reações dos compostos orgânicos',
    image: '/chemistry.jpg',
    progress: 90,
    instructor: 'Dr. Pedro Costa',
    duration: '54 horas',
    enrolled: 156,
    rating: 4.7,
    category: 'Exatas'
  },
  {
    id: 4,
    name: 'Biologia Celular',
    description: 'Estrutura e funcionamento das células, organelas e processos celulares',
    image: '/biology.jpg',
    progress: 30,
    instructor: 'Dra. Ana Oliveira',
    duration: '42 horas',
    enrolled: 178,
    rating: 4.9,
    category: 'Ciências'
  },
  {
    id: 5,
    name: 'História da Arte',
    description: 'Panorama histórico das principais manifestações artísticas da humanidade',
    image: '/art.jpg',
    progress: 60,
    instructor: 'Prof. Carlos Mendes',
    duration: '36 horas',
    enrolled: 145,
    rating: 4.5,
    category: 'Humanas'
  },
  {
    id: 6,
    name: 'Literatura Brasileira',
    description: 'Estudo das principais obras e autores da literatura nacional',
    image: '/literature.jpg',
    progress: 15,
    instructor: 'Profa. Beatriz Lima',
    duration: '45 horas',
    enrolled: 167,
    rating: 4.4,
    category: 'Humanas'
  }
]

export default function CoursesPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meus Cursos</h1>
            <p className="text-gray-600">Gerencie seus cursos e acompanhe seu progresso</p>
          </div>
          <div className="flex space-x-4">
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas as Categorias</option>
            <option value="exatas">Exatas</option>
            <option value="humanas">Humanas</option>
            <option value="ciencias">Ciências</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Ordenar por</option>
            <option value="progress">Progresso</option>
            <option value="name">Nome</option>
            <option value="rating">Avaliação</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Cursos Ativos</div>
            <div className="text-2xl font-bold text-gray-800">6</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média de Progresso</div>
            <div className="text-2xl font-bold text-gray-800">52%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 8%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Horas Estudadas</div>
            <div className="text-2xl font-bold text-gray-800">145h</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 12h</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Certificados</div>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course List Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_COURSES.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 relative">
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  {course.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm">
                  <span className="material-icons text-gray-400 text-base mr-2">person</span>
                  <span className="text-gray-600">{course.instructor}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="material-icons text-gray-400 text-base mr-2">schedule</span>
                  <span className="text-gray-600">{course.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="material-icons text-gray-400 text-base mr-2">groups</span>
                  <span className="text-gray-600">{course.enrolled} alunos</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="material-icons text-yellow-400 text-base mr-2">star</span>
                  <span className="text-gray-600">{course.rating}/5.0</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso</span>
                    <span className="text-gray-800">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button className="text-gray-600 hover:text-gray-800">
                    <span className="material-icons">bookmark_border</span>
                  </button>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Course Card */}
        <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer">
          <span className="material-icons text-4xl mb-2">add_circle_outline</span>
          <span className="text-sm font-medium">Adicionar Novo Curso</span>
        </div>
      </div>
    </div>
  )
}

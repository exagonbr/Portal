'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

interface CurriculumItem {
  id: number
  subject: string
  grade: string
  hours: number
  status: 'active' | 'inactive' | 'revision'
  teacher: string
  lastUpdate: string
}

export default function CoordinatorCurriculumPage() {
  const { user } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('all')

  const curriculumData: CurriculumItem[] = [
    {
      id: 1,
      subject: 'Matemática',
      grade: '1º Ano',
      hours: 120,
      status: 'active',
      teacher: 'Prof. João Silva',
      lastUpdate: '2024-03-15'
    },
    {
      id: 2,
      subject: 'Português',
      grade: '1º Ano',
      hours: 100,
      status: 'active',
      teacher: 'Prof. Maria Santos',
      lastUpdate: '2024-03-14'
    },
    {
      id: 3,
      subject: 'Ciências',
      grade: '2º Ano',
      hours: 80,
      status: 'revision',
      teacher: 'Prof. Carlos Lima',
      lastUpdate: '2024-03-10'
    },
    {
      id: 4,
      subject: 'História',
      grade: '3º Ano',
      hours: 60,
      status: 'inactive',
      teacher: 'Prof. Ana Costa',
      lastUpdate: '2024-03-05'
    }
  ]

  const filteredCurriculum = curriculumData.filter(item => {
    const gradeMatch = selectedGrade === 'all' || item.grade === selectedGrade
    const subjectMatch = selectedSubject === 'all' || item.subject === selectedSubject
    return gradeMatch && subjectMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-accent-green/20 text-accent-green'
      case 'revision': return 'bg-accent-yellow/20 text-accent-yellow'
      case 'inactive': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'revision': return 'Em Revisão'
      case 'inactive': return 'Inativo'
      default: return 'Desconhecido'
    }
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.COORDINATOR]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Gestão Curricular"
          subtitle="Gerencie e organize o currículo escolar"
        >
          <div className="space-y-6">
            {/* Controles e Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas as Séries</option>
                  <option value="1º Ano">1º Ano</option>
                  <option value="2º Ano">2º Ano</option>
                  <option value="3º Ano">3º Ano</option>
                </select>
                
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas as Matérias</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Português">Português</option>
                  <option value="Ciências">Ciências</option>
                  <option value="História">História</option>
                </select>
              </div>
              
              <div className="flex gap-3">
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                  Exportar Currículo
                </button>
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200">
                  Nova Disciplina
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Total de Disciplinas</div>
                    <div className="text-2xl font-bold text-gray-600">{curriculumData.length}</div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20">
                    <span className="material-symbols-outlined text-lg text-primary">school</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Horas Totais</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {curriculumData.reduce((total, item) => total + item.hours, 0)}h
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-blue/20">
                    <span className="material-symbols-outlined text-lg text-accent-blue">schedule</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Disciplinas Ativas</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {curriculumData.filter(item => item.status === 'active').length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-green/20">
                    <span className="material-symbols-outlined text-lg text-accent-green">check_circle</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Em Revisão</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {curriculumData.filter(item => item.status === 'revision').length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-yellow/20">
                    <span className="material-symbols-outlined text-lg text-accent-yellow">edit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Currículo */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">
                  Grade Curricular ({filteredCurriculum.length} disciplinas)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Disciplina
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Série
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Carga Horária
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Professor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Última Atualização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCurriculum.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="material-symbols-outlined text-primary mr-3">book</span>
                            <div className="font-medium text-gray-700">{item.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.hours}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.teacher}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                            {getStatusText(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.lastUpdate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary hover:text-primary/80 mr-3 transition-colors duration-200">
                            Editar
                          </button>
                          <button className="text-accent-blue hover:text-accent-blue/80 mr-3 transition-colors duration-200">
                            Detalhes
                          </button>
                          <button className="text-error hover:text-error/80 transition-colors duration-200">
                            Remover
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Planejamento Curricular */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Planejamento Curricular</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Próximas Ações</h4>
                    <div className="space-y-3">
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <span className="material-symbols-outlined text-accent-yellow mr-3">schedule</span>
                        <div>
                          <div className="font-medium text-gray-700">Revisão de Ciências - 2º Ano</div>
                          <div className="text-sm text-gray-500">Prazo: 25/03/2024</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <span className="material-symbols-outlined text-accent-blue mr-3">group</span>
                        <div>
                          <div className="font-medium text-gray-700">Reunião Pedagógica</div>
                          <div className="text-sm text-gray-500">Data: 22/03/2024</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                        <span className="material-symbols-outlined text-primary mr-3">assessment</span>
                        <div>
                          <div className="font-medium text-gray-700">Avaliação Curricular</div>
                          <div className="text-sm text-gray-500">Trimestre: 1º/2024</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-4">Recursos Disponíveis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-accent-green mr-3">library_books</span>
                          <span className="font-medium text-gray-700">Material Didático</span>
                        </div>
                        <span className="text-accent-green text-sm">Disponível</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-accent-green mr-3">computer</span>
                          <span className="font-medium text-gray-700">Laboratório de Informática</span>
                        </div>
                        <span className="text-accent-green text-sm">Disponível</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-accent-yellow mr-3">science</span>
                          <span className="font-medium text-gray-700">Laboratório de Ciências</span>
                        </div>
                        <span className="text-accent-yellow text-sm">Em Manutenção</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
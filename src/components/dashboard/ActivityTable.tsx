'use client'

import { useAuth } from '@/contexts/AuthContext'
import { teacherMockData } from '@/constants/dashboardData'

interface Activity {
  id: number
  tipo: string
  disciplina: string
  turma: string
  alunos: number
  status: 'Concluído' | 'Em Andamento' | 'Pendente'
  data: string
}

export default function ActivityTable() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const activities: Activity[] = [
    {
      id: 1,
      tipo: 'Avaliação',
      disciplina: 'Matemática',
      turma: '9º Ano A',
      alunos: 25,
      status: 'Em Andamento',
      data: '20/01/2024'
    },
    {
      id: 2,
      tipo: 'Trabalho',
      disciplina: 'Física',
      turma: '8º Ano B',
      alunos: 22,
      status: 'Concluído',
      data: '19/01/2024'
    },
    {
      id: 3,
      tipo: 'Exercícios',
      disciplina: 'Química',
      turma: '9º Ano B',
      alunos: 20,
      status: 'Pendente',
      data: '21/01/2024'
    },
    {
      id: 4,
      tipo: 'Projeto',
      disciplina: 'Biologia',
      turma: '8º Ano A',
      alunos: 23,
      status: 'Em Andamento',
      data: '22/01/2024'
    }
  ]

  const getStatusStyle = (status: Activity['status']) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-600'
      case 'Em Andamento':
        return 'bg-blue-100 text-blue-600'
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="p-6 flex items-center justify-between border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold">Atividades</h2>
          <p className="text-sm text-gray-500 mt-1">Acompanhamento de atividades e avaliações</p>
        </div>
        <select className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <option value="today">Hoje</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
        </select>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="pb-4 font-medium">Tipo</th>
                <th className="pb-4 font-medium">Disciplina</th>
                <th className="pb-4 font-medium">Turma</th>
                <th className="pb-4 font-medium">Alunos</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4">{activity.tipo}</td>
                  <td className="py-4">{activity.disciplina}</td>
                  <td className="py-4">{activity.turma}</td>
                  <td className="py-4">{activity.alunos}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle(activity.status)}`}>
                      {activity.status}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">{activity.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {activities.length === 0 && (
          <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <span className="material-symbols-outlined text-4xl">assignment</span>
            <p>Nenhuma atividade registrada</p>
          </div>
        )}
      </div>
    </div>
  )
}

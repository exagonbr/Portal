'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_REPORTS = [
  {
    id: 1,
    title: 'Relatório de Notas - 1º Bimestre',
    type: 'academic',
    description: 'Boletim completo com notas de todas as disciplinas',
    date: '2024-03-20',
    status: 'available',
    format: 'PDF',
    size: '2.1 MB'
  },
  {
    id: 2,
    title: 'Relatório de Frequência - Março',
    type: 'attendance',
    description: 'Relatório detalhado de frequência escolar',
    date: '2024-03-19',
    status: 'available',
    format: 'PDF',
    size: '1.5 MB'
  },
  {
    id: 3,
    title: 'Relatório de Atividades - Março',
    type: 'activities',
    description: 'Resumo das atividades e tarefas realizadas',
    date: '2024-03-18',
    status: 'processing',
    format: 'PDF',
    size: '-'
  }
]

export default function PortalReportsPage() {
  const { user } = useAuth()
  const [selectedType, setSelectedType] = useState('all')

  const filteredReports = MOCK_REPORTS.filter(report => 
    selectedType === 'all' || report.type === selectedType
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-600 mb-2">Relatórios</h1>
        <p className="text-gray-600">Acesse e baixe relatórios acadêmicos</p>
      </div>

      <div className="mb-6">
        <select 
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Relatórios</option>
          <option value="academic">Acadêmicos</option>
          <option value="attendance">Frequência</option>
          <option value="activities">Atividades</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">{report.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{report.description}</p>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div>Data: {new Date(report.date).toLocaleDateString('pt-BR')}</div>
              <div>Formato: {report.format}</div>
              <div>Tamanho: {report.size}</div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                report.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {report.status === 'available' ? 'Disponível' : 'Processando'}
              </span>
              
              {report.status === 'available' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                  Baixar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
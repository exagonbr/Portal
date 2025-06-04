'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_ATTENDANCE_DATA = [
  {
    childId: 1,
    childName: 'Ana Silva Santos',
    grade: '8º Ano B',
    currentMonth: {
      totalDays: 20,
      presentDays: 19,
      absentDays: 1,
      lateArrivals: 2,
      attendanceRate: 95
    },
    monthlyHistory: [
      { month: 'Janeiro', present: 18, absent: 2, late: 1, rate: 90 },
      { month: 'Fevereiro', present: 19, absent: 1, late: 0, rate: 95 },
      { month: 'Março', present: 19, absent: 1, late: 2, rate: 95 }
    ],
    recentRecords: [
      { date: '2024-03-20', status: 'present', time: '07:30', notes: '' },
      { date: '2024-03-19', status: 'present', time: '07:25', notes: '' },
      { date: '2024-03-18', status: 'late', time: '08:15', notes: 'Atraso justificado - consulta médica' },
      { date: '2024-03-17', status: 'absent', time: '', notes: 'Falta justificada - doença' },
      { date: '2024-03-16', status: 'present', time: '07:20', notes: '' }
    ]
  },
  {
    childId: 2,
    childName: 'Pedro Silva Santos',
    grade: '5º Ano A',
    currentMonth: {
      totalDays: 20,
      presentDays: 20,
      absentDays: 0,
      lateArrivals: 0,
      attendanceRate: 100
    },
    monthlyHistory: [
      { month: 'Janeiro', present: 20, absent: 0, late: 0, rate: 100 },
      { month: 'Fevereiro', present: 20, absent: 0, late: 1, rate: 100 },
      { month: 'Março', present: 20, absent: 0, late: 0, rate: 100 }
    ],
    recentRecords: [
      { date: '2024-03-20', status: 'present', time: '07:15', notes: '' },
      { date: '2024-03-19', status: 'present', time: '07:10', notes: '' },
      { date: '2024-03-18', status: 'present', time: '07:20', notes: '' },
      { date: '2024-03-17', status: 'present', time: '07:15', notes: '' },
      { date: '2024-03-16', status: 'present', time: '07:25', notes: '' }
    ]
  }
]

export default function GuardianAttendancePage() {
  const { user } = useAuth()
  const [selectedChild, setSelectedChild] = useState(MOCK_ATTENDANCE_DATA[0])
  const [selectedTab, setSelectedTab] = useState('current')
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-accent-green bg-accent-green/20'
      case 'absent':
        return 'text-error bg-error/20'
      case 'late':
        return 'text-accent-yellow bg-accent-yellow/20'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return 'Presente'
      case 'absent':
        return 'Falta'
      case 'late':
        return 'Atraso'
      default:
        return 'N/A'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Frequência Escolar</h1>
            <p className="text-gray-600">Acompanhe a frequência dos seus filhos</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="month">Mês Atual</option>
              <option value="semester">Semestre</option>
              <option value="year">Ano Letivo</option>
            </select>
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors">
              <span className="material-symbols-outlined">download</span>
              <span>Relatório</span>
            </button>
          </div>
        </div>

        {/* Children Selector */}
        <div className="flex space-x-4 mb-6">
          {MOCK_ATTENDANCE_DATA.map((child) => (
            <button
              key={child.childId}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                selectedChild.childId === child.childId
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-primary-dark">{child.childName}</div>
                <div className="text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Attendance Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Frequência</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.currentMonth.attendanceRate}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  selectedChild.currentMonth.attendanceRate >= 95 ? 'bg-accent-green' :
                  selectedChild.currentMonth.attendanceRate >= 85 ? 'bg-accent-yellow' : 'bg-error'
                }`}
                style={{ width: `${selectedChild.currentMonth.attendanceRate}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Dias Presentes</div>
            <div className="text-2xl font-bold text-accent-green">{selectedChild.currentMonth.presentDays}</div>
            <div className="text-sm text-gray-600 mt-1">
              de {selectedChild.currentMonth.totalDays} dias letivos
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Faltas</div>
            <div className="text-2xl font-bold text-error">{selectedChild.currentMonth.absentDays}</div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedChild.currentMonth.absentDays === 0 ? 'Nenhuma falta' : 'faltas este mês'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Atrasos</div>
            <div className="text-2xl font-bold text-accent-yellow">{selectedChild.currentMonth.lateArrivals}</div>
            <div className="text-sm text-gray-600 mt-1">
              {selectedChild.currentMonth.lateArrivals === 0 ? 'Nenhum atraso' : 'atrasos este mês'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'current'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Frequência Atual
            </button>
            <button
              onClick={() => setSelectedTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico Mensal
            </button>
            <button
              onClick={() => setSelectedTab('records')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'records'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Registros Detalhados
            </button>
          </nav>
        </div>
      </div>

      {/* Current Tab */}
      {selectedTab === 'current' && (
        <div className="space-y-6">
          {/* Current Month Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Resumo do Mês - {selectedChild.childName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-dark mb-3">Estatísticas</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total de dias letivos:</span>
                    <span className="font-semibold">{selectedChild.currentMonth.totalDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dias presentes:</span>
                    <span className="font-semibold text-accent-green">{selectedChild.currentMonth.presentDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Faltas:</span>
                    <span className="font-semibold text-error">{selectedChild.currentMonth.absentDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Atrasos:</span>
                    <span className="font-semibold text-accent-yellow">{selectedChild.currentMonth.lateArrivals}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-primary-dark mb-3">Status da Frequência</h4>
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${
                    selectedChild.currentMonth.attendanceRate >= 95 ? 'text-accent-green' :
                    selectedChild.currentMonth.attendanceRate >= 85 ? 'text-accent-yellow' : 'text-error'
                  }`}>
                    {selectedChild.currentMonth.attendanceRate}%
                  </div>
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    selectedChild.currentMonth.attendanceRate >= 95 ? 'bg-accent-green/20 text-accent-green' :
                    selectedChild.currentMonth.attendanceRate >= 85 ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-error/20 text-error'
                  }`}>
                    {selectedChild.currentMonth.attendanceRate >= 95 ? 'Excelente' :
                     selectedChild.currentMonth.attendanceRate >= 85 ? 'Boa' : 'Atenção Necessária'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-primary">Mês</th>
                  <th className="text-left py-3 px-6 font-medium text-primary">Presentes</th>
                  <th className="text-left py-3 px-6 font-medium text-primary">Faltas</th>
                  <th className="text-left py-3 px-6 font-medium text-primary">Atrasos</th>
                  <th className="text-left py-3 px-6 font-medium text-primary">Taxa</th>
                  <th className="text-left py-3 px-6 font-medium text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedChild.monthlyHistory.map((month, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-primary-dark">{month.month}</td>
                    <td className="py-4 px-6 text-accent-green">{month.present}</td>
                    <td className="py-4 px-6 text-error">{month.absent}</td>
                    <td className="py-4 px-6 text-accent-yellow">{month.late}</td>
                    <td className="py-4 px-6 font-medium">{month.rate}%</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        month.rate >= 95 ? 'bg-accent-green/20 text-accent-green' :
                        month.rate >= 85 ? 'bg-accent-yellow/20 text-accent-yellow' : 'bg-error/20 text-error'
                      }`}>
                        {month.rate >= 95 ? 'Excelente' :
                         month.rate >= 85 ? 'Boa' : 'Atenção'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Records Tab */}
      {selectedTab === 'records' && (
        <div className="space-y-4">
          {selectedChild.recentRecords.map((record, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    record.status === 'present' ? 'bg-accent-green/20' :
                    record.status === 'absent' ? 'bg-error/20' : 'bg-accent-yellow/20'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      record.status === 'present' ? 'text-accent-green' :
                      record.status === 'absent' ? 'text-error' : 'text-accent-yellow'
                    }`}>
                      {record.status === 'present' ? 'check' :
                       record.status === 'absent' ? 'close' : 'schedule'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-primary-dark">
                      {new Date(record.date).toLocaleDateString('pt-BR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.time && `Horário: ${record.time}`}
                    </div>
                    {record.notes && (
                      <div className="text-sm text-primary mt-1">
                        <strong>Observação:</strong> {record.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                  {getStatusText(record.status)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
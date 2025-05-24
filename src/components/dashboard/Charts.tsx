'use client'

import { useAuth } from '@/contexts/AuthContext'
import { teacherMockData, studentMockData } from '@/constants/dashboardData'

interface ChartDataDetails {
  [key: string]: string | number
}

interface ChartDataItem {
  label: string
  value: number
  details?: ChartDataDetails
}

interface ChartProps {
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'pie' | 'stats'
  data: ChartDataItem[]
  height?: string
  showLegend?: boolean
}

export function Chart({ title, subtitle, type, data, height = 'h-64', showLegend = false }: ChartProps) {
  const maxValue = Math.max(...data.map(item => item.value))
  const getHeight = (value: number) => (value / maxValue) * 100

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`${height} flex items-center justify-center`}>
          <p className="text-gray-500">Não há dados disponíveis</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      
      <div className="p-4">
        {type === 'line' && (
          <div className={height}>
            <div className="relative h-full flex items-end space-x-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                {[100, 75, 50, 25, 0].map((value) => (
                  <span key={value}>{value}%</span>
                ))}
              </div>
              {/* Chart lines */}
              <div className="flex-1 flex items-end space-x-2 pl-8">
                {data.map((item, index) => (
                  <div key={index} className="group relative flex-1">
                    <div 
                      className="bg-blue-500 bg-opacity-20 rounded-t-lg transition-all duration-200 hover:bg-opacity-30"
                      style={{ height: `${getHeight(item.value)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {item.label}: {item.value}%
                        {item.details && (
                          <div className="mt-1 text-xs opacity-75">
                            {Object.entries(item.details).map(([key, value]) => (
                              <div key={key}>{key}: {String(value)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="grid grid-cols-12 gap-2 mt-4 pl-8">
              {data.map((item, index) => (
                <div key={index} className="text-center text-xs text-gray-500 transform -rotate-45 origin-top-left">
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'bar' && (
          <div className={height}>
            <div className="relative h-full flex items-end space-x-2">
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
                {[10, 7.5, 5, 2.5, 0].map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
              <div className="flex-1 flex items-end space-x-2 pl-8">
                {data.map((item, index) => (
                  <div key={index} className="group relative flex-1">
                    <div 
                      className="bg-blue-500 rounded-t-lg transition-all duration-200 hover:bg-blue-600"
                      style={{ height: `${(item.value / 10) * 100}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {item.label}: {item.value}
                        {item.details && (
                          <div className="mt-1 text-xs opacity-75">
                            {Object.entries(item.details).map(([key, value]) => (
                              <div key={key}>{key}: {String(value)}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-6 gap-2 mt-4 pl-8">
              {data.map((item, index) => (
                <div key={index} className="text-center text-xs text-gray-500 transform -rotate-45 origin-top-left">
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === 'pie' && (
          <div className={`${height} flex items-center justify-between`}>
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-sm text-gray-500">Total</div>
              </div>
              {data.map((item, index) => {
                const total = data.reduce((sum, i) => sum + i.value, 0)
                const percentage = (item.value / total) * 100
                const rotation = index === 0 ? 0 : data
                  .slice(0, index)
                  .reduce((sum, i) => sum + (i.value / total) * 360, 0)
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0 group"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 transition-all duration-200 hover:scale-105"
                      style={{
                        background: `conic-gradient(from 0deg, var(--color-${index}) ${percentage * 3.6}deg, transparent ${percentage * 3.6}deg)`,
                        '--color-0': '#3B82F6',
                        '--color-1': '#60A5FA',
                        '--color-2': '#93C5FD',
                        '--color-3': '#BFDBFE',
                        '--color-4': '#2563EB',
                        '--color-5': '#1D4ED8',
                      } as any}
                    />
                    <div className="absolute top-1/2 left-full transform -translate-y-1/2 ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {item.label}: {percentage.toFixed(1)}%
                      {item.details && (
                        <div className="mt-1 text-xs opacity-75">
                          {Object.entries(item.details).map(([key, value]) => (
                            <div key={key}>{key}: {String(value)}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            {showLegend && (
              <div className="ml-8 space-y-2">
                {data.map((item, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{
                        backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#2563EB', '#1D4ED8'][index]
                      }}
                    />
                    <span className="text-gray-600">{item.label}</span>
                    {item.value && <span className="ml-2 text-gray-400">({item.value})</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {type === 'stats' && (
          <div className="grid grid-cols-2 gap-4">
            {data.map((item, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50">
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="text-xl font-semibold mt-1">{item.value}</div>
                {item.details?.change !== undefined && (
                  <div className={`text-sm ${Number(item.details.change) >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center mt-1`}>
                    <span className="material-symbols-outlined text-sm mr-1">
                      {Number(item.details.change) >= 0 ? 'trending_up' : 'trending_down'}
                    </span>
                    {Number(item.details.change) >= 0 ? '+' : ''}{item.details.change}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Charts() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (user.role === 'teacher') {
    const performanceData = teacherMockData.studentPerformance.map(item => ({
      label: item.month,
      value: item.average,
      details: {
        'Aprovados': item.approved,
        'Pendentes': item.pending
      }
    }))

    const attendanceData = teacherMockData.classAttendance.map(item => ({
      label: item.month,
      value: item.attendance,
      details: {
        'Presentes': item.present,
        'Total': item.total
      }
    }))

    const subjectData = teacherMockData.subjectDistribution.map(item => ({
      label: item.subject,
      value: item.students,
      details: {
        'Média': item.averageGrade,
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`
      }
    }))

    const classPerformance = teacherMockData.classPerformance.map(item => ({
      label: item.class,
      value: item.averageGrade * 10,
      details: {
        'Alunos': item.students,
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`
      }
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Desempenho dos Alunos" 
            subtitle="Média mensal e status dos alunos"
            type="line" 
            data={performanceData}
            height="h-80"
          />
          <Chart 
            title="Frequência nas Aulas" 
            subtitle="Taxa de presença mensal"
            type="line" 
            data={attendanceData}
            height="h-80"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Distribuição por Disciplina" 
            subtitle="Alunos e desempenho por matéria"
            type="pie" 
            data={subjectData}
            height="h-80"
            showLegend={true}
          />
          <Chart 
            title="Desempenho por Turma" 
            subtitle="Média e indicadores por turma"
            type="bar" 
            data={classPerformance}
            height="h-80"
          />
        </div>
      </div>
    )
  }

  if (user.role === 'student') {
    const gradeData = studentMockData.gradeHistory.map(subject => ({
      label: subject.subject.substring(0, 3),
      value: subject.average,
      details: {
        'Professor': subject.teacher,
        'Ranking': `${subject.ranking}º lugar`
      }
    }))

    const attendanceData = studentMockData.attendanceBySubject.map(item => ({
      label: item.subject.substring(0, 3),
      value: item.attendance,
      details: {
        'Aulas': `${item.presentClasses}/${item.totalClasses}`,
        'Última Falta': item.lastAbsence
      }
    }))

    const studyData = studentMockData.weeklyStudyHours.map(item => ({
      label: item.day.substring(0, 3),
      value: item.hours * 10,
      details: {
        'Matérias': item.subjects.join(', ')
      }
    }))

    const performanceData = studentMockData.performanceHistory.map(item => ({
      label: item.month.substring(0, 3),
      value: item.averageGrade * 10,
      details: {
        'Frequência': `${item.attendanceRate}%`,
        'Conclusão': `${item.completionRate}%`,
        'Ranking': `${item.ranking}º`
      }
    }))

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Notas por Disciplina" 
            subtitle="Média e ranking em cada matéria"
            type="bar" 
            data={gradeData}
            height="h-80"
          />
          <Chart 
            title="Frequência por Disciplina" 
            subtitle="Taxa de presença e histórico"
            type="bar" 
            data={attendanceData}
            height="h-80"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart 
            title="Horas de Estudo" 
            subtitle="Dedicação semanal por dia"
            type="line" 
            data={studyData}
            height="h-80"
          />
          <Chart 
            title="Evolução do Desempenho" 
            subtitle="Progresso ao longo do tempo"
            type="line" 
            data={performanceData}
            height="h-80"
          />
        </div>
      </div>
    )
  }

  return null
}
